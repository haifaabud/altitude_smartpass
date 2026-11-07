export type BudgetPeriod = 'weekly' | 'monthly';

export type PersonalBudget = {
  amount: number;
  period: BudgetPeriod;
};

export type Expense = {
  id: string;
  amount: number;
  description: string;
  date: string;
};

export type RewardEvent = {
  id: string;
  type: 'purchase' | 'period-bonus';
  points: number;
  date: string;
  active: boolean;
  expenseId?: string;
  periodKey?: string;
};

export type BudgetPeriodSnapshot = {
  period: BudgetPeriod;
  amount: number;
};

export type CompletedBudgetPeriod = {
  id: string;
  periodKey: string;
  period: BudgetPeriod;
  budgetAmount: number;
  completedAt: string;
  totalSpent: number;
  hadQualifyingPurchase: boolean;
  bonusAwarded: boolean;
};

export type BudgetData = {
  budget: PersonalBudget | null;
  expenses: Expense[];
  rewardEvents: RewardEvent[];
  periodBudgets: Record<string, BudgetPeriodSnapshot>;
  completedPeriods: CompletedBudgetPeriod[];
};

export type ExpenseInput = {
  amount: string;
  description: string;
  date: string;
};

export type BudgetMenuRecommendation = {
  kind: 'pairing' | 'single';
  items: { name: string; price: number }[];
  totalPrice: number;
};

export const EMPTY_BUDGET_DATA: BudgetData = {
  budget: null,
  expenses: [],
  rewardEvents: [],
  periodBudgets: {},
  completedPeriods: [],
};

export function parsePositiveAmount(value: string) {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error('Enter an amount greater than AED 0, with up to 2 decimal places.');
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than AED 0.');
  }
  if (!Number.isSafeInteger(Math.round(amount * 100))) {
    throw new Error('Enter an amount with a valid AED value.');
  }

  return roundToCents(amount);
}

export function validateBudget(budget: PersonalBudget): PersonalBudget {
  if (!Number.isFinite(budget.amount) || budget.amount <= 0) {
    throw new Error('Your budget must be greater than AED 0.');
  }
  if (!Number.isSafeInteger(Math.round(budget.amount * 100))) {
    throw new Error('Enter a budget with a valid AED value.');
  }
  if (!['weekly', 'monthly'].includes(budget.period)) {
    throw new Error('Choose a weekly or monthly budget period.');
  }

  return { amount: roundToCents(budget.amount), period: budget.period };
}

export function validateExpense(input: ExpenseInput): Omit<Expense, 'id'> {
  const amount = parsePositiveAmount(input.amount);
  const description = input.description.trim();
  if (!description) {
    throw new Error('Enter a menu item or purchase description.');
  }
  if (!isValidIsoDate(input.date)) {
    throw new Error('Enter a valid purchase date in YYYY-MM-DD format.');
  }

  return { amount, description, date: input.date };
}

export function getPeriodExpenses(
  expenses: Expense[],
  period: BudgetPeriod,
  now: Date = new Date(),
) {
  const today = toLocalIsoDate(now);
  const currentPeriod = period === 'monthly' ? today.slice(0, 7) : getWeekStart(today);

  return expenses.filter((expense) => {
    if (period === 'monthly') return expense.date.slice(0, 7) === currentPeriod;
    return getWeekStart(expense.date) === currentPeriod;
  });
}

export function getBudgetPeriodKey(date: string, period: BudgetPeriod) {
  const key = period === 'monthly' ? date.slice(0, 7) : getWeekStart(date);
  return `${period}:${key}`;
}

export function getBudgetPeriodEndDate(periodKey: string, period: BudgetPeriod) {
  const rawKey = periodKey.slice(period.length + 1);
  const date = period === 'monthly'
    ? new Date(`${rawKey}-01T00:00:00.000Z`)
    : new Date(`${rawKey}T00:00:00.000Z`);

  if (!Number.isFinite(date.getTime())) {
    throw new Error('Saved budget period is invalid.');
  }

  if (period === 'monthly') {
    date.setUTCMonth(date.getUTCMonth() + 1);
    date.setUTCDate(0);
  } else {
    date.setUTCDate(date.getUTCDate() + 6);
  }
  return date.toISOString().slice(0, 10);
}

export function getTotalSpent(expenses: Expense[]) {
  const totalCents = expenses.reduce((total, expense) => total + Math.round(expense.amount * 100), 0);
  return totalCents / 100;
}

export function getRemainingBudget(budget: PersonalBudget, expenses: Expense[]) {
  return roundToCents(budget.amount - getTotalSpent(expenses));
}

export function getSpentPercentage(budget: PersonalBudget, expenses: Expense[]) {
  if (budget.amount <= 0) return 0;
  return Math.min((getTotalSpent(expenses) / budget.amount) * 100, 100);
}

export function getBudgetRecommendations(
  menuItems: readonly { name: string; price: number }[],
  remainingBudget: number,
  limit = 2,
): BudgetMenuRecommendation[] {
  if (!Number.isFinite(remainingBudget) || remainingBudget <= 0 || limit <= 0) return [];

  const affordableItems = menuItems.filter(
    (item) => Number.isFinite(item.price) && item.price > 0 && item.price <= remainingBudget,
  );
  const pairings: BudgetMenuRecommendation[] = [];

  for (let first = 0; first < affordableItems.length; first += 1) {
    for (let second = first + 1; second < affordableItems.length; second += 1) {
      const items = [affordableItems[first], affordableItems[second]];
      const totalPrice = items[0].price + items[1].price;
      if (totalPrice <= remainingBudget) {
        pairings.push({ kind: 'pairing', items, totalPrice });
      }
    }
  }

  pairings.sort(
    (a, b) =>
      b.totalPrice - a.totalPrice ||
      a.items
        .map((item) => item.name)
        .join('|')
        .localeCompare(b.items.map((item) => item.name).join('|')),
  );

  if (pairings.length > 0) return pairings.slice(0, limit);

  return affordableItems
    .sort((a, b) => b.price - a.price || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((item) => ({ kind: 'single', items: [item], totalPrice: item.price }));
}

export function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseBudgetData(value: string): BudgetData {
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed) || !Array.isArray(parsed.expenses)) {
    throw new Error('Saved budget data has an invalid format.');
  }

  const budget =
    parsed.budget === null
      ? null
      : isRecord(parsed.budget) &&
          typeof parsed.budget.amount === 'number' &&
          (parsed.budget.period === 'weekly' || parsed.budget.period === 'monthly')
        ? validateBudget({ amount: parsed.budget.amount, period: parsed.budget.period })
        : invalidStoredData();

  const expenses = parsed.expenses.map(parseStoredExpense);
  const rewardEvents = parsed.rewardEvents === undefined
    ? []
    : parseStoredRewardEvents(parsed.rewardEvents);
  const periodBudgets = parsed.periodBudgets === undefined
    ? {}
    : parseStoredPeriodBudgets(parsed.periodBudgets);
  const completedPeriods = parsed.completedPeriods === undefined
    ? []
    : parseStoredCompletedPeriods(parsed.completedPeriods);
  return { budget, expenses, rewardEvents, periodBudgets, completedPeriods };
}

function parseStoredRewardEvents(value: unknown): RewardEvent[] {
  if (!Array.isArray(value)) return invalidStoredData();
  const events = value.map((item): RewardEvent => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      (item.type !== 'purchase' && item.type !== 'period-bonus') ||
      typeof item.points !== 'number' ||
      !Number.isSafeInteger(item.points) ||
      item.points < 0 ||
      typeof item.date !== 'string' ||
      !isValidIsoDate(item.date) ||
      typeof item.active !== 'boolean' ||
      (item.expenseId !== undefined && typeof item.expenseId !== 'string') ||
      (item.periodKey !== undefined && typeof item.periodKey !== 'string')
    ) {
      return invalidStoredData();
    }

    return {
      id: item.id,
      type: item.type,
      points: item.points,
      date: item.date,
      active: item.active,
      ...(typeof item.expenseId === 'string' ? { expenseId: item.expenseId } : {}),
      ...(typeof item.periodKey === 'string' ? { periodKey: item.periodKey } : {}),
    };
  });
  if (new Set(events.map((event) => event.id)).size !== events.length) return invalidStoredData();
  return events;
}

function parseStoredPeriodBudgets(value: unknown): Record<string, BudgetPeriodSnapshot> {
  if (!isRecord(value)) return invalidStoredData();
  return Object.fromEntries(
    Object.entries(value).map(([id, snapshot]) => {
      if (
        !isRecord(snapshot) ||
        (snapshot.period !== 'weekly' && snapshot.period !== 'monthly') ||
        typeof snapshot.amount !== 'number'
      ) {
        return invalidStoredData();
      }

      const periodKey = periodKeyFromId(id, snapshot.period);
      if (!periodKey) return invalidStoredData();
      const validated = validateBudget({ amount: snapshot.amount, period: snapshot.period });
      return [id, { period: snapshot.period, amount: validated.amount }];
    }),
  );
}

function parseStoredCompletedPeriods(value: unknown): CompletedBudgetPeriod[] {
  if (!Array.isArray(value)) return invalidStoredData();
  const periods = value.map((item): CompletedBudgetPeriod => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.periodKey !== 'string' ||
      (item.period !== 'weekly' && item.period !== 'monthly') ||
      typeof item.budgetAmount !== 'number' ||
      typeof item.completedAt !== 'string' ||
      !isValidIsoDate(item.completedAt) ||
      typeof item.totalSpent !== 'number' ||
      !Number.isFinite(item.totalSpent) ||
      item.totalSpent < 0 ||
      typeof item.hadQualifyingPurchase !== 'boolean' ||
      typeof item.bonusAwarded !== 'boolean' ||
      !periodKeyFromId(item.id, item.period)
    ) {
      return invalidStoredData();
    }

    const budget = validateBudget({ amount: item.budgetAmount, period: item.period });
    return {
      id: item.id,
      periodKey: item.periodKey,
      period: item.period,
      budgetAmount: budget.amount,
      completedAt: item.completedAt,
      totalSpent: roundToCents(item.totalSpent),
      hadQualifyingPurchase: item.hadQualifyingPurchase,
      bonusAwarded: item.bonusAwarded,
    };
  });
  if (new Set(periods.map((period) => period.id)).size !== periods.length) {
    return invalidStoredData();
  }
  return periods;
}

function parseStoredExpense(value: unknown): Expense {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.amount !== 'number' ||
    typeof value.description !== 'string' ||
    typeof value.date !== 'string'
  ) {
    return invalidStoredData();
  }

  const validated = validateExpense({
    amount: String(value.amount),
    description: value.description,
    date: value.date,
  });
  return { ...validated, id: value.id };
}

function getWeekStart(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const dayOfWeek = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - ((dayOfWeek + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function periodKeyFromId(id: string, period: BudgetPeriod) {
  const prefix = `${period}:`;
  if (!id.startsWith(prefix)) return null;
  const key = id.slice(prefix.length);
  if (period === 'monthly') {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(key) ? key : null;
  }
  if (!isValidIsoDate(key) || getWeekStart(key) !== key) return null;
  return key;
}

function roundToCents(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidStoredData(): never {
  throw new Error('Saved budget data has an invalid format.');
}
