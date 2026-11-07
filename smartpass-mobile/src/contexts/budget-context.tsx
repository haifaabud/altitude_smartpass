import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import {
  EMPTY_BUDGET_DATA,
  parseBudgetData,
  validateBudget,
  validateExpense,
  type BudgetData,
  type BudgetPeriod,
  type ExpenseInput,
  type PersonalBudget,
} from '@/utils/budget';
import { cafeConfig } from '@/constants/cafe-config';
import {
  deleteExpenseWithRewards,
  saveBudgetWithRewards,
  saveExpenseWithRewards,
  synchronizeRewards,
} from '@/utils/rewards';

const STORAGE_KEY = 'smartpass:budget-ledger:v1';

type BudgetContextValue = {
  budget: PersonalBudget | null;
  expenses: BudgetData['expenses'];
  rewardEvents: BudgetData['rewardEvents'];
  periodBudgets: BudgetData['periodBudgets'];
  completedPeriods: BudgetData['completedPeriods'];
  isLoaded: boolean;
  storageError: string | null;
  retryLoad: () => void;
  saveBudget: (amount: number, period: BudgetPeriod) => Promise<void>;
  saveExpense: (
    input: ExpenseInput,
    id?: string,
  ) => Promise<{ pointsAwarded: number; pointsRevoked: boolean }>;
  deleteExpense: (id: string) => Promise<void>;
};

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BudgetData>(EMPTY_BUDGET_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const dataRef = useRef(data);
  const isLoadedRef = useRef(false);
  const loadFailedRef = useRef(false);
  const writesRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = stored === null ? EMPTY_BUDGET_DATA : parseBudgetData(stored);
        const loadedData = synchronizeRewards(parsed, parsed.budget, cafeConfig.loyalty);
        if (stored !== JSON.stringify(loadedData)) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loadedData));
        }
        if (!active) return;

        dataRef.current = loadedData;
        setData(loadedData);
        loadFailedRef.current = false;
        setStorageError(null);
      } catch {
        if (!active) return;
        loadFailedRef.current = true;
        setStorageError('Saved spending data could not be loaded. Retry before making changes.');
      } finally {
        if (active) {
          isLoadedRef.current = true;
          setIsLoaded(true);
        }
      }
    }

    isLoadedRef.current = false;
    void load();

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const commit = useCallback(<T,>(
    update: (current: BudgetData) => { data: BudgetData; result: T },
  ) => {
    const operation = writesRef.current.then(async () => {
      if (!isLoadedRef.current || loadFailedRef.current) {
        throw new Error('Budget data is not ready to save. Retry loading your saved data.');
      }

      const { data: next, result } = update(dataRef.current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      dataRef.current = next;
      setData(next);
      setStorageError(null);
      return result;
    });

    writesRef.current = operation.then(
      () => undefined,
      () => setStorageError('Could not save your change on this device. Please try again.'),
    );

    return operation;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !isLoadedRef.current || loadFailedRef.current) return;
      void commit((current) => ({
        data: synchronizeRewards(current, current.budget, cafeConfig.loyalty),
        result: undefined,
      })).catch((error: unknown) => {
        setStorageError(
          error instanceof Error ? error.message : 'Could not update completed reward periods.',
        );
      });
    });
    return () => subscription.remove();
  }, [commit]);

  const retryLoad = useCallback(() => {
    isLoadedRef.current = false;
    setIsLoaded(false);
    setLoadAttempt((attempt) => attempt + 1);
  }, []);

  const saveBudget = useCallback(
    (amount: number, period: BudgetPeriod) => {
      const budget = validateBudget({ amount, period });
      return commit((current) => ({
        data: saveBudgetWithRewards(current, budget, cafeConfig.loyalty),
        result: undefined,
      }));
    },
    [commit],
  );

  const saveExpense = useCallback(
    (input: ExpenseInput, id?: string) => {
      const expenseDetails = validateExpense(input);
      const expenseId = id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      return commit((current) => {
        const result = saveExpenseWithRewards(
          current,
          expenseDetails,
          expenseId,
          current.budget,
          cafeConfig.loyalty,
        );
        return {
          data: result.data,
          result: {
            pointsAwarded: result.pointsAwarded,
            pointsRevoked: result.pointsRevoked,
          },
        };
      });
    },
    [commit],
  );

  const deleteExpense = useCallback(
    (id: string) =>
      commit((current) => ({
        data: deleteExpenseWithRewards(current, id, current.budget, cafeConfig.loyalty),
        result: undefined,
      })),
    [commit],
  );

  const value: BudgetContextValue = {
    budget: data.budget,
    expenses: data.expenses,
    rewardEvents: data.rewardEvents,
    periodBudgets: data.periodBudgets,
    completedPeriods: data.completedPeriods,
    isLoaded,
    storageError,
    retryLoad,
    saveBudget,
    saveExpense,
    deleteExpense,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === null) {
    throw new Error('useBudget must be used inside a BudgetProvider.');
  }
  return context;
}
