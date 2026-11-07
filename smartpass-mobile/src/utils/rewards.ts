import type {
  BudgetData,
  BudgetPeriod,
  Expense,
  RewardEvent,
} from './budget.ts';
import {
  getBudgetPeriodEndDate,
  getBudgetPeriodKey,
  getTotalSpent,
  toLocalIsoDate,
} from './budget.ts';

export type RewardConfiguration = {
  pointsPerQualifyingPurchase: number;
  responsibleSpendingPeriodBonus: number;
  maxQualifyingPurchaseRewardsPerDay: number;
  rewardThreshold: number;
};

export type RewardTotals = {
  totalPoints: number;
  purchasePoints: number;
  responsibleSpendingPoints: number;
};

export function synchronizeRewards(
  source: BudgetData,
  budget: BudgetData['budget'],
  config: RewardConfiguration,
  now: Date = new Date(),
): BudgetData {
  let data = ensureCurrentBudgetPeriod(source, budget, now);
  data = closeCompletedPeriods(data, now, config);
  return reconcilePeriodBonuses(data);
}

export function saveBudgetWithRewards(
  source: BudgetData,
  budget: NonNullable<BudgetData['budget']>,
  config: RewardConfiguration,
  now: Date = new Date(),
): BudgetData {
  const id = getBudgetPeriodKey(toLocalIsoDate(now), budget.period);
  const withCurrentBudget = {
    ...source,
    budget,
    periodBudgets: {
      ...source.periodBudgets,
      [id]: { period: budget.period, amount: budget.amount },
    },
  };
  return synchronizeRewards(withCurrentBudget, budget, config, now);
}

export function saveExpenseWithRewards(
  source: BudgetData,
  expense: Omit<Expense, 'id'>,
  expenseId: string,
  budget: BudgetData['budget'],
  config: RewardConfiguration,
  now: Date = new Date(),
): { data: BudgetData; pointsAwarded: number; pointsRevoked: boolean } {
  const current = synchronizeRewards(source, budget, config, now);
  const existing = current.expenses.find((item) => item.id === expenseId);
  const eventId = `purchase:${expenseId}`;
  const existingEvent = current.rewardEvents.find((event) => event.id === eventId);
  const expenses = existing
    ? current.expenses.map((item) =>
        item.id === expenseId ? { ...expense, id: expenseId } : item,
      )
    : [...current.expenses, { ...expense, id: expenseId }];
  const rewardEvents = [...current.rewardEvents];
  let pointsAwarded = 0;
  let pointsRevoked = false;

  if (
    existing &&
    existingEvent?.active &&
    (existing.amount !== expense.amount || existing.date !== expense.date)
  ) {
    updateEventActive(rewardEvents, eventId, false);
    pointsRevoked = true;
  } else if (!existing && !existingEvent && budget) {
    const periodKey = getBudgetPeriodKey(expense.date, budget.period);
    const periodBudget = current.periodBudgets[periodKey];
    const spendBeforeExpense = getTotalSpent(
      current.expenses.filter(
        (item) => getBudgetPeriodKey(item.date, budget.period) === periodKey,
      ),
    );
    const remainingBeforePurchase = periodBudget
      ? periodBudget.amount - spendBeforeExpense
      : Number.NEGATIVE_INFINITY;
    const dailyRewards = rewardEvents.filter(
      (event) => event.type === 'purchase' && event.active && event.date === expense.date,
    ).length;

    if (
      periodBudget &&
      expense.amount <= remainingBeforePurchase &&
      dailyRewards < config.maxQualifyingPurchaseRewardsPerDay
    ) {
      pointsAwarded = config.pointsPerQualifyingPurchase;
      rewardEvents.push({
        id: eventId,
        type: 'purchase',
        points: pointsAwarded,
        date: expense.date,
        active: true,
        expenseId,
      });
    }
  }

  const updated: BudgetData = { ...current, expenses, rewardEvents };
  return {
    data: reconcilePeriodBonuses(closeCompletedPeriods(updated, now, config)),
    pointsAwarded,
    pointsRevoked,
  };
}

export function deleteExpenseWithRewards(
  source: BudgetData,
  expenseId: string,
  budget: BudgetData['budget'],
  config: RewardConfiguration,
  now: Date = new Date(),
): BudgetData {
  const current = synchronizeRewards(source, budget, config, now);
  const rewardEvents = current.rewardEvents.map((event) =>
    event.type === 'purchase' && event.expenseId === expenseId
      ? { ...event, active: false }
      : event,
  );
  const updated = {
    ...current,
    expenses: current.expenses.filter((expense) => expense.id !== expenseId),
    rewardEvents,
  };
  return reconcilePeriodBonuses(closeCompletedPeriods(updated, now, config));
}

export function getRewardTotals(events: RewardEvent[]): RewardTotals {
  return events.reduce<RewardTotals>(
    (totals, event) => {
      if (!event.active) return totals;
      if (event.type === 'purchase') totals.purchasePoints += event.points;
      else totals.responsibleSpendingPoints += event.points;
      totals.totalPoints += event.points;
      return totals;
    },
    { totalPoints: 0, purchasePoints: 0, responsibleSpendingPoints: 0 },
  );
}

export function getPendingPeriodBonus(
  data: BudgetData,
  budget: BudgetData['budget'],
  config: RewardConfiguration,
  now: Date = new Date(),
) {
  if (!budget) return 0;
  const today = toLocalIsoDate(now);
  const periodKey = getBudgetPeriodKey(today, budget.period);
  const snapshot = data.periodBudgets[periodKey];
  if (!snapshot || data.completedPeriods.some((item) => item.id === periodKey)) return 0;

  const expenses = expensesForPeriod(data.expenses, periodKey, budget.period);
  if (getTotalSpent(expenses) > snapshot.amount) return 0;
  return hasQualifyingPurchase(data, periodKey, budget.period)
    ? config.responsibleSpendingPeriodBonus
    : 0;
}

function ensureCurrentBudgetPeriod(
  data: BudgetData,
  budget: BudgetData['budget'],
  now: Date,
): BudgetData {
  if (!budget) return data;

  const currentDate = toLocalIsoDate(now);
  const currentId = getBudgetPeriodKey(currentDate, budget.period);
  const currentKey = rawPeriodKey(currentId)!;
  const snapshots = { ...data.periodBudgets };
  const previous = Object.entries(snapshots)
    .filter(([, snapshot]) => snapshot.period === budget.period)
    .map(([id, snapshot]) => ({ id, snapshot, key: rawPeriodKey(id) }))
    .filter(({ key }) => key !== null && periodStart(key, budget.period) < periodStart(currentKey, budget.period))
    .sort((a, b) => periodStart(b.key!, budget.period).localeCompare(periodStart(a.key!, budget.period)))[0];

  if (previous) {
    let key = previous.key!;
    while (true) {
      key = advancePeriodKey(key, budget.period);
      if (periodStart(key, budget.period) >= periodStart(currentKey, budget.period)) break;
      const id = `${budget.period}:${key}`;
      if (!snapshots[id]) snapshots[id] = { ...previous.snapshot };
    }
  }

  if (!snapshots[currentId]) {
    snapshots[currentId] = { period: budget.period, amount: budget.amount };
  }
  return { ...data, periodBudgets: snapshots };
}

function closeCompletedPeriods(
  source: BudgetData,
  now: Date,
  config: RewardConfiguration,
): BudgetData {
  const today = toLocalIsoDate(now);
  const completedPeriods = [...source.completedPeriods];
  const rewardEvents = [...source.rewardEvents];

  for (const [id, snapshot] of Object.entries(source.periodBudgets)) {
    const endDate = getBudgetPeriodEndDate(id, snapshot.period);
    if (endDate >= today || completedPeriods.some((period) => period.id === id)) continue;

    const spent = getTotalSpent(expensesForPeriod(source.expenses, id, snapshot.period));
    const hasPurchase = hasQualifyingPurchase(source, id, snapshot.period);
    const bonusAwarded = spent <= snapshot.amount && hasPurchase;
    completedPeriods.push({
      id,
      periodKey: rawPeriodKey(id)!,
      period: snapshot.period,
      budgetAmount: snapshot.amount,
      completedAt: today,
      totalSpent: spent,
      hadQualifyingPurchase: hasPurchase,
      bonusAwarded,
    });

    if (bonusAwarded && !rewardEvents.some((event) => event.id === `bonus:${id}`)) {
      rewardEvents.push({
        id: `bonus:${id}`,
        type: 'period-bonus',
        points: config.responsibleSpendingPeriodBonus,
        date: today,
        active: true,
        periodKey: id,
      });
    }
  }

  return { ...source, completedPeriods, rewardEvents };
}

function reconcilePeriodBonuses(data: BudgetData): BudgetData {
  let changed = false;
  const rewardEvents = data.rewardEvents.map((event) => {
    if (event.type !== 'period-bonus' || !event.active || !event.periodKey) return event;
    const completed = data.completedPeriods.find((period) => period.id === event.periodKey);
    if (!completed) return event;

    const spent = getTotalSpent(
      expensesForPeriod(data.expenses, completed.id, completed.period),
    );
    const stillEligible =
      spent <= completed.budgetAmount &&
      hasQualifyingPurchase(data, completed.id, completed.period);
    if (stillEligible) return event;
    changed = true;
    return { ...event, active: false };
  });
  return changed ? { ...data, rewardEvents } : data;
}

function hasQualifyingPurchase(data: BudgetData, periodKey: string, period: BudgetPeriod) {
  const expenseIds = new Set(
    expensesForPeriod(data.expenses, periodKey, period).map((expense) => expense.id),
  );
  return data.rewardEvents.some(
    (event) =>
      event.type === 'purchase' &&
      event.active &&
      event.expenseId !== undefined &&
      expenseIds.has(event.expenseId),
  );
}

function expensesForPeriod(expenses: Expense[], id: string, period: BudgetPeriod) {
  return expenses.filter((expense) => getBudgetPeriodKey(expense.date, period) === id);
}

function updateEventActive(events: RewardEvent[], id: string, active: boolean) {
  const index = events.findIndex((event) => event.id === id);
  if (index >= 0) events[index] = { ...events[index], active };
}

function rawPeriodKey(id: string) {
  const separator = id.indexOf(':');
  return separator < 0 ? null : id.slice(separator + 1);
}

function periodStart(key: string, period: BudgetPeriod) {
  return period === 'monthly' ? `${key}-01` : key;
}

function advancePeriodKey(key: string, period: BudgetPeriod) {
  const date = new Date(`${periodStart(key, period)}T00:00:00.000Z`);
  if (period === 'monthly') date.setUTCMonth(date.getUTCMonth() + 1);
  else date.setUTCDate(date.getUTCDate() + 7);
  const value = date.toISOString().slice(0, 10);
  return period === 'monthly' ? value.slice(0, 7) : value;
}
