import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getPeriodExpenses,
  getBudgetRecommendations,
  getRemainingBudget,
  getSpentPercentage,
  getTotalSpent,
  parseBudgetData,
  parsePositiveAmount,
  validateExpense,
} from './budget.ts';

test('requires a positive amount with at most two decimal places', () => {
  assert.equal(parsePositiveAmount('12.50'), 12.5);
  assert.throws(() => parsePositiveAmount('0'), /greater than AED 0/);
  assert.throws(() => parsePositiveAmount('-1'), /greater than AED 0/);
  assert.throws(() => parsePositiveAmount('1.234'), /up to 2 decimal places/);
  assert.throws(() => parsePositiveAmount('90071992547410'), /valid AED value/);
});

test('validates expense descriptions and real calendar dates', () => {
  assert.deepEqual(
    validateExpense({ amount: '9.25', description: '  Latte  ', date: '2026-11-07' }),
    { amount: 9.25, description: 'Latte', date: '2026-11-07' },
  );
  assert.throws(
    () => validateExpense({ amount: '5', description: ' ', date: '2026-11-07' }),
    /description/,
  );
  assert.throws(
    () => validateExpense({ amount: '5', description: 'Coffee', date: '2026-02-30' }),
    /valid purchase date/,
  );
});

test('calculates remaining budget and caps progress when spending exceeds the plan', () => {
  const expenses = [
    { id: '1', amount: 12.25, description: 'Latte', date: '2026-11-07' },
    { id: '2', amount: 8.5, description: 'Coffee', date: '2026-11-07' },
  ];
  const budget = { amount: 20, period: 'monthly' };

  assert.equal(getTotalSpent(expenses), 20.75);
  assert.equal(getRemainingBudget(budget, expenses), -0.75);
  assert.equal(getSpentPercentage(budget, expenses), 100);
});

test('recommends affordable menu pairings before single items', () => {
  const menu = [
    { name: 'Espresso', price: 10 },
    { name: 'Americano', price: 12 },
    { name: 'Latte', price: 15 },
    { name: 'Unavailable item', price: Number.NaN },
  ];
  const suggestions = getBudgetRecommendations(menu, 27);

  assert.equal(suggestions.length, 2);
  assert.ok(suggestions.every((suggestion) => suggestion.kind === 'pairing'));
  assert.ok(suggestions.every((suggestion) => suggestion.totalPrice <= 27));
  assert.equal(suggestions[0].totalPrice, 27);
});

test('recommends affordable single items if no menu pair fits', () => {
  const menu = [
    { name: 'Espresso', price: 10 },
    { name: 'Americano', price: 12 },
    { name: 'Latte', price: 15 },
  ];

  assert.deepEqual(
    getBudgetRecommendations(menu, 15).map(({ kind, totalPrice }) => ({ kind, totalPrice })),
    [
      { kind: 'single', totalPrice: 15 },
      { kind: 'single', totalPrice: 12 },
    ],
  );
  assert.deepEqual(getBudgetRecommendations(menu, 9), []);
});

test('filters expenses to the current Monday-to-Sunday week or calendar month', () => {
  const expenses = [
    { id: '1', amount: 2, description: 'Before week', date: '2026-11-01' },
    { id: '2', amount: 3, description: 'Monday', date: '2026-11-02' },
    { id: '3', amount: 4, description: 'Sunday', date: '2026-11-08' },
    { id: '4', amount: 5, description: 'Next week', date: '2026-11-09' },
    { id: '5', amount: 6, description: 'Next month', date: '2026-12-01' },
  ];
  const now = new Date(2026, 10, 4, 12);

  assert.deepEqual(
    getPeriodExpenses(expenses, 'weekly', now).map((expense) => expense.id),
    ['2', '3'],
  );
  assert.deepEqual(
    getPeriodExpenses(expenses, 'monthly', now).map((expense) => expense.id),
    ['1', '2', '3', '4'],
  );
});

test('rejects malformed saved budget data instead of silently resetting it', () => {
  assert.deepEqual(parseBudgetData('{"budget":null,"expenses":[]}'), {
    budget: null,
    expenses: [],
    rewardEvents: [],
    periodBudgets: {},
    completedPeriods: [],
  });
  assert.throws(() => parseBudgetData('not-json'));
  assert.throws(() => parseBudgetData('{"budget":null,"expenses":[{}]}'), /invalid format/);
});

test('preserves reward events and completed period snapshots through storage parsing', () => {
  const saved = {
    budget: { amount: 100, period: 'monthly' },
    expenses: [{ id: 'coffee', amount: 10, description: 'Coffee', date: '2026-11-07' }],
    rewardEvents: [{
      id: 'purchase:coffee',
      type: 'purchase',
      points: 10,
      date: '2026-11-07',
      active: true,
      expenseId: 'coffee',
    }],
    periodBudgets: { 'monthly:2026-11': { period: 'monthly', amount: 100 } },
    completedPeriods: [{
      id: 'monthly:2026-10',
      periodKey: '2026-10',
      period: 'monthly',
      budgetAmount: 100,
      completedAt: '2026-11-01',
      totalSpent: 20,
      hadQualifyingPurchase: true,
      bonusAwarded: true,
    }],
  };

  assert.deepEqual(parseBudgetData(JSON.stringify(saved)), saved);
});

test('migrates existing budget and expense storage with empty rewards data', () => {
  const parsed = parseBudgetData(JSON.stringify({
    budget: { amount: 180, period: 'monthly' },
    expenses: [{ id: 'old', amount: 12, description: 'Coffee', date: '2026-11-02' }],
  }));
  assert.deepEqual(parsed, {
    budget: { amount: 180, period: 'monthly' },
    expenses: [{ id: 'old', amount: 12, description: 'Coffee', date: '2026-11-02' }],
    rewardEvents: [],
    periodBudgets: {},
    completedPeriods: [],
  });
});
