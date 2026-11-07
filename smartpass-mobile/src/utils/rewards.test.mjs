import assert from 'node:assert/strict';
import test from 'node:test';

import { EMPTY_BUDGET_DATA } from './budget.ts';
import {
  deleteExpenseWithRewards,
  getPendingPeriodBonus,
  getRewardTotals,
  saveBudgetWithRewards,
  saveExpenseWithRewards,
  synchronizeRewards,
} from './rewards.ts';

const config = {
  pointsPerQualifyingPurchase: 10,
  responsibleSpendingPeriodBonus: 25,
  maxQualifyingPurchaseRewardsPerDay: 1,
  rewardThreshold: 100,
};

function localDate(year, month, day) {
  return new Date(year, month - 1, day, 12);
}

function startBudget(amount = 200, period = 'monthly', date = localDate(2026, 11, 7)) {
  return saveBudgetWithRewards(EMPTY_BUDGET_DATA, { amount, period }, config, date);
}

function addExpense(data, id, amount, date, now = new Date(`${date}T12:00:00`)) {
  return saveExpenseWithRewards(
    data,
    { amount, description: `Purchase ${id}`, date },
    id,
    data.budget,
    config,
    now,
  );
}

test('awards fixed purchase points for an expense within remaining budget', () => {
  const result = addExpense(startBudget(20), 'fit', 12, '2026-11-07');
  assert.equal(result.pointsAwarded, 10);
  assert.equal(getRewardTotals(result.data.rewardEvents).purchasePoints, 10);
});

test('awards purchase points when expense equals remaining budget', () => {
  const result = addExpense(startBudget(20), 'exact', 20, '2026-11-07');
  assert.equal(result.pointsAwarded, 10);
});

test('uses remaining budget before the new expense is added', () => {
  let data = startBudget(20);
  data = addExpense(data, 'earlier', 11, '2026-11-07').data;
  assert.equal(addExpense(data, 'fits-rest', 9, '2026-11-08').pointsAwarded, 10);
  assert.equal(addExpense(data, 'exceeds-rest', 9.01, '2026-11-08').pointsAwarded, 0);
});

test('allows an over-budget expense but awards no purchase points', () => {
  const result = addExpense(startBudget(20), 'over', 21, '2026-11-07');
  assert.equal(result.pointsAwarded, 0);
  assert.equal(result.data.expenses.length, 1);
});

test('awards fixed points regardless of purchase amount', () => {
  let data = startBudget(200);
  let result = addExpense(data, 'small', 10, '2026-11-07');
  data = result.data;
  assert.equal(result.pointsAwarded, 10);
  result = addExpense(data, 'larger', 50, '2026-11-08');
  assert.equal(result.pointsAwarded, 10);
  assert.equal(getRewardTotals(result.data.rewardEvents).purchasePoints, 20);
});

test('limits qualifying purchase rewards to one per day', () => {
  let data = startBudget(100);
  data = addExpense(data, 'first', 10, '2026-11-07').data;
  const result = addExpense(data, 'second', 10, '2026-11-07');
  assert.equal(result.pointsAwarded, 0);
  assert.equal(getRewardTotals(result.data.rewardEvents).purchasePoints, 10);
});

test('does not duplicate a purchase reward when an expense id is saved again', () => {
  let data = startBudget(100);
  data = addExpense(data, 'same-id', 10, '2026-11-07').data;
  const result = addExpense(data, 'same-id', 10, '2026-11-07');
  assert.equal(result.pointsAwarded, 0);
  assert.equal(result.data.rewardEvents.length, 1);
});

test('awards weekly period bonus after period end when qualified and within budget', () => {
  let data = startBudget(100, 'weekly', localDate(2026, 11, 2));
  data = addExpense(data, 'weekly-coffee', 10, '2026-11-02', localDate(2026, 11, 2)).data;
  data = synchronizeRewards(data, data.budget, config, localDate(2026, 11, 9));
  assert.equal(getRewardTotals(data.rewardEvents).responsibleSpendingPoints, 25);
  assert.equal(data.completedPeriods.length, 1);
});

test('awards monthly period bonus after period end when qualified and within budget', () => {
  let data = startBudget(200);
  data = addExpense(data, 'monthly-coffee', 18, '2026-11-07').data;
  data = synchronizeRewards(data, data.budget, config, localDate(2026, 12, 1));
  assert.equal(getRewardTotals(data.rewardEvents).totalPoints, 35);
});

test('does not award responsible-spending bonus if period spending exceeds budget', () => {
  let data = startBudget(20);
  data = addExpense(data, 'qualifying', 10, '2026-11-07').data;
  data = addExpense(data, 'later-spend', 15, '2026-11-08').data;
  data = synchronizeRewards(data, data.budget, config, localDate(2026, 12, 1));
  assert.equal(getRewardTotals(data.rewardEvents).purchasePoints, 10);
  assert.equal(getRewardTotals(data.rewardEvents).responsibleSpendingPoints, 0);
});

test('does not award period bonus without a qualifying purchase', () => {
  let data = startBudget(10);
  data = addExpense(data, 'too-expensive', 11, '2026-11-07').data;
  data = synchronizeRewards(data, data.budget, config, localDate(2026, 12, 1));
  assert.equal(getRewardTotals(data.rewardEvents).responsibleSpendingPoints, 0);
  assert.equal(data.completedPeriods[0].bonusAwarded, false);
});

test('does not duplicate a period bonus after data is restored and synchronized', () => {
  let data = startBudget(100);
  data = addExpense(data, 'coffee', 10, '2026-11-07').data;
  data = synchronizeRewards(data, data.budget, config, localDate(2026, 12, 1));
  data = synchronizeRewards(JSON.parse(JSON.stringify(data)), data.budget, config, localDate(2026, 12, 1));
  assert.equal(getRewardTotals(data.rewardEvents).responsibleSpendingPoints, 25);
  assert.equal(data.rewardEvents.filter((event) => event.type === 'period-bonus').length, 1);
});

test('keeps purchase points when later expenses exceed the budget', () => {
  let data = startBudget(20);
  data = addExpense(data, 'fits', 10, '2026-11-07').data;
  data = addExpense(data, 'over-later', 15, '2026-11-08').data;
  assert.equal(getRewardTotals(data.rewardEvents).purchasePoints, 10);
});

test('revokes purchase points when an awarded expense amount changes', () => {
  let data = startBudget(100);
  data = addExpense(data, 'edited', 10, '2026-11-07').data;
  const result = saveExpenseWithRewards(
    data,
    { amount: 110, description: 'Edited purchase', date: '2026-11-07' },
    'edited',
    data.budget,
    config,
    localDate(2026, 11, 8),
  );
  assert.equal(result.pointsRevoked, true);
  assert.equal(getRewardTotals(result.data.rewardEvents).purchasePoints, 0);
});

test('keeps purchase points if only the expense description changes', () => {
  let data = startBudget(100);
  data = addExpense(data, 'description-edit', 10, '2026-11-07').data;
  const result = saveExpenseWithRewards(
    data,
    { amount: 10, description: 'Corrected description', date: '2026-11-07' },
    'description-edit',
    data.budget,
    config,
    localDate(2026, 11, 8),
  );
  assert.equal(result.pointsRevoked, false);
  assert.equal(getRewardTotals(result.data.rewardEvents).purchasePoints, 10);
});

test('revokes purchase points when the qualifying expense is deleted', () => {
  let data = startBudget(100);
  data = addExpense(data, 'deleted', 10, '2026-11-07').data;
  data = deleteExpenseWithRewards(data, 'deleted', data.budget, config, localDate(2026, 11, 8));
  assert.equal(data.expenses.length, 0);
  assert.equal(getRewardTotals(data.rewardEvents).purchasePoints, 0);
});

test('revokes a period bonus if its qualifying expense is deleted', () => {
  let data = startBudget(100);
  data = addExpense(data, 'period-entry', 10, '2026-11-07').data;
  data = synchronizeRewards(data, data.budget, config, localDate(2026, 12, 1));
  assert.equal(getRewardTotals(data.rewardEvents).responsibleSpendingPoints, 25);
  data = deleteExpenseWithRewards(data, 'period-entry', data.budget, config, localDate(2026, 12, 1));
  assert.equal(getRewardTotals(data.rewardEvents).responsibleSpendingPoints, 0);
});

test('creates a new period budget and evaluates the previous period after the transition', () => {
  let data = startBudget(100);
  data = addExpense(data, 'november', 10, '2026-11-07').data;
  data = synchronizeRewards(data, data.budget, config, localDate(2026, 12, 1));
  data = synchronizeRewards(data, data.budget, config, localDate(2026, 12, 1));
  const result = addExpense(data, 'december', 20, '2026-12-01', localDate(2026, 12, 1));
  assert.equal(result.pointsAwarded, 10);
  assert.equal(result.data.periodBudgets['monthly:2026-12'].amount, 100);
  assert.equal(result.data.completedPeriods.length, 1);
});

test('evaluates a saved period when the app is reopened after multiple periods passed', () => {
  let data = startBudget(100);
  data = addExpense(data, 'november-coffee', 10, '2026-11-07').data;
  data = synchronizeRewards(data, data.budget, config, localDate(2027, 1, 1));
  assert.equal(getRewardTotals(data.rewardEvents).responsibleSpendingPoints, 25);
  assert.equal(data.completedPeriods.length, 2);
  assert.ok(data.periodBudgets['monthly:2026-12']);
  assert.ok(data.periodBudgets['monthly:2027-01']);
});

test('shows eligible in-progress bonus as pending, not earned', () => {
  let data = startBudget(100);
  assert.equal(getPendingPeriodBonus(data, data.budget, config), 0);
  data = addExpense(data, 'pending-coffee', 10, '2026-11-07').data;
  assert.equal(
    getPendingPeriodBonus(data, data.budget, config, localDate(2026, 11, 8)),
    25,
  );
  assert.equal(getRewardTotals(data.rewardEvents).responsibleSpendingPoints, 0);
});
