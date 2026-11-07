import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AltitudeBrand } from '@/components/altitude-brand';
import { AnimatedEntrance } from '@/components/animated-entrance';
import { AnimatedProgressBar } from '@/components/animated-progress-bar';
import { MenuRecommendation } from '@/components/menu-recommendation';
import { PressableScale } from '@/components/pressable-scale';
import { cafeConfig, formatCurrency } from '@/constants/cafe-config';
import { ButtonTokens, CardTokens, Elevation, Fonts, Radius } from '@/constants/theme';
import { useBudget } from '@/contexts/budget-context';
import { useTheme } from '@/hooks/use-theme';
import {
  getPeriodExpenses,
  getRemainingBudget,
  getSpentPercentage,
  getTotalSpent,
  parsePositiveAmount,
  toLocalIsoDate,
  validateExpense,
  type BudgetPeriod,
  type Expense,
} from '@/utils/budget';

export default function BudgetScreen() {
  const theme = useTheme();
  const {
    budget,
    expenses,
    isLoaded,
    storageError,
    retryLoad,
    saveBudget,
    saveExpense,
    deleteExpense,
  } = useBudget();
  const [budgetEditorOpen, setBudgetEditorOpen] = useState<boolean | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>('monthly');
  const [budgetFormError, setBudgetFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(toLocalIsoDate(new Date()));
  const [expenseFormError, setExpenseFormError] = useState<string | null>(null);

  const showBudgetEditor = budgetEditorOpen ?? (isLoaded && budget === null);
  const activePeriod = budget?.period ?? 'monthly';
  const periodExpenses = useMemo(
    () => getPeriodExpenses(expenses, activePeriod),
    [activePeriod, expenses],
  );
  const totalSpent = getTotalSpent(periodExpenses);
  const remainingBudget = budget ? getRemainingBudget(budget, periodExpenses) : null;
  const spentPercentage = budget ? getSpentPercentage(budget, periodExpenses) : 0;
  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [expenses],
  );

  async function handleSaveBudget() {
    let amount: number;
    try {
      amount = parsePositiveAmount(budgetAmount);
    } catch (error) {
      setBudgetFormError(error instanceof Error ? error.message : 'Enter a valid budget amount.');
      return;
    }

    setBudgetFormError(null);
    setIsSaving(true);
    try {
      await saveBudget(amount, budgetPeriod);
      setBudgetEditorOpen(false);
      setNotice('Your personal café budget has been saved.');
    } catch (error) {
      setBudgetFormError(error instanceof Error ? error.message : 'Could not save your budget.');
    } finally {
      setIsSaving(false);
    }
  }

  function openNewExpense() {
    setEditingExpense(null);
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseDate(toLocalIsoDate(new Date()));
    setExpenseFormError(null);
    setExpenseModalOpen(true);
  }

  function openExpenseForEdit(expense: Expense) {
    setEditingExpense(expense);
    setExpenseAmount(String(expense.amount));
    setExpenseDescription(expense.description);
    setExpenseDate(expense.date);
    setExpenseFormError(null);
    setExpenseModalOpen(true);
  }

  async function handleSaveExpense() {
    try {
      const input = {
        amount: expenseAmount,
        description: expenseDescription,
        date: expenseDate,
      };
      validateExpense(input);
      setIsSaving(true);
      const rewardResult = await saveExpense(input, editingExpense?.id);
      setExpenseModalOpen(false);
      setNotice(
        rewardResult.pointsAwarded > 0
          ? `Expense added. You earned ${rewardResult.pointsAwarded} demo purchase points.`
          : rewardResult.pointsRevoked
            ? 'Expense updated. Its purchase points were removed because the amount or date changed.'
            : editingExpense
              ? 'Your expense has been updated.'
              : 'Expense added to your spending.',
      );
    } catch (error) {
      setExpenseFormError(error instanceof Error ? error.message : 'Could not save this expense.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteExpense() {
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      await deleteExpense(confirmDelete.id);
      setNotice('Expense deleted and your plan recalculated.');
      setConfirmDelete(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not delete this expense.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AltitudeBrand color={theme.text} />
            <Text style={styles.badge}>YOUR PLAN</Text>
          </View>

          <View style={styles.intro}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>A LITTLE ROOM FOR COFFEE</Text>
            <Text style={[styles.title, { color: theme.text }]}>Spend with intention.</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              A personal guide for your Altitude visits.
            </Text>
          </View>

          {storageError && (
            <View accessibilityRole="alert" style={styles.errorBanner}>
              <Text style={styles.errorText}>{storageError}</Text>
              <Pressable accessibilityRole="button" onPress={retryLoad} style={styles.retryButton}>
                <Text style={styles.retryText}>RETRY</Text>
              </Pressable>
            </View>
          )}

          {notice && !storageError && (
            <PressableScale
              accessibilityRole="button"
              onPress={() => setNotice(null)}
              style={styles.successBanner}>
              <Text style={styles.successText}>{notice}</Text>
              <Text style={styles.dismissText}>×</Text>
            </PressableScale>
          )}

          {!isLoaded ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading your saved plan…
              </Text>
            </View>
          ) : (
            <>
              {budget ? (
                <>
                  <AnimatedEntrance style={styles.planCard}>
                    <View style={styles.planTopRow}>
                      <Text style={styles.planLabel}>PERSONAL {budget.period.toUpperCase()} PLAN</Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          setNotice(null);
                          if (!showBudgetEditor) {
                            setBudgetAmount(String(budget.amount));
                            setBudgetPeriod(budget.period);
                          }
                          setBudgetFormError(null);
                          setBudgetEditorOpen(!showBudgetEditor);
                        }}>
                          <Text style={styles.editBudgetText}>
                            {showBudgetEditor ? 'CANCEL' : 'EDIT BUDGET'}
                        </Text>
                      </Pressable>
                    </View>
                    <View style={styles.amountLine}>
                      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.remainingAmount}>
                        {formatCurrency(remainingBudget ?? 0)}
                      </Text>
                      <Text style={styles.leftLabel}>remaining</Text>
                    </View>
                    <AnimatedProgressBar
                      label={`${Math.round(spentPercentage)} percent of your ${budget.period} café plan used`}
                      progress={spentPercentage}
                      color="#D5B18C"
                      trackColor="rgba(255,255,255,0.22)"
                      style={styles.progressTrack}
                    />
                    <View style={styles.progressLegend}>
                      <Text style={styles.legendText}>Spent {formatCurrency(totalSpent)}</Text>
                      <Text style={styles.legendText}>Plan {formatCurrency(budget.amount)}</Text>
                    </View>
                  </AnimatedEntrance>

                  <View style={styles.infoCard}>
                    <View style={styles.infoMark}>
                      <Text style={styles.infoMarkText}>i</Text>
                    </View>
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                      This is your spending plan, not a wallet balance. Only expenses you record are
                      counted.
                    </Text>
                  </View>
                </>
              ) : (
                <AnimatedEntrance style={styles.emptyPlanCard}>
                  <Text style={styles.emptyPlanTitle}>Start with your own café plan.</Text>
                  <Text style={styles.emptyPlanCopy}>
                    Choose a weekly or monthly amount that feels right for you.
                  </Text>
                </AnimatedEntrance>
              )}

              {showBudgetEditor && (
                <AnimatedEntrance style={styles.formCard}>
                  <Text style={styles.formTitle}>{budget ? 'Edit your budget' : 'Set your budget'}</Text>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    PERSONAL BUDGET · AED
                  </Text>
                  <View style={styles.amountInputWrap}>
                    <Text style={styles.currencyPrefix}>AED</Text>
                    <TextInput
                      accessibilityLabel="Personal budget amount in AED"
                      keyboardType="decimal-pad"
                      onChangeText={setBudgetAmount}
                      placeholder="150.00"
                      placeholderTextColor="#A99C91"
                      returnKeyType="done"
                      style={styles.amountInput}
                      value={budgetAmount}
                    />
                  </View>
                  <Text style={[styles.inputLabel, styles.periodLabel, { color: theme.textSecondary }]}>
                    BUDGET PERIOD
                  </Text>
                  <View style={styles.periodOptions}>
                    {(['weekly', 'monthly'] as const).map((period) => {
                      const selected = budgetPeriod === period;
                      return (
                        <PressableScale
                          key={period}
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          onPress={() => setBudgetPeriod(period)}
                          style={[styles.periodOption, selected && styles.periodOptionSelected]}>
                          <Text style={[styles.periodOptionText, selected && styles.periodOptionTextSelected]}>
                            {period === 'weekly' ? 'Weekly' : 'Monthly'}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                  {budgetFormError && <Text style={styles.formError}>{budgetFormError}</Text>}
                  <View style={styles.formActions}>
                    {budget && (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          setBudgetEditorOpen(false);
                          setBudgetAmount(String(budget.amount));
                          setBudgetPeriod(budget.period);
                          setBudgetFormError(null);
                        }}
                        style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>CANCEL</Text>
                      </Pressable>
                    )}
                    <Pressable
                      accessibilityRole="button"
                      disabled={isSaving}
                      onPress={handleSaveBudget}
                      style={[styles.primaryButton, isSaving && styles.disabledButton]}>
                      <Text style={styles.primaryButtonText}>
                        {isSaving ? 'SAVING…' : budget ? 'SAVE CHANGES' : 'SAVE MY PLAN'}
                      </Text>
                    </Pressable>
                  </View>
                </AnimatedEntrance>
              )}

              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeadingCopy}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Your spending</Text>
                  <Text style={[styles.sectionCaption, { color: theme.textSecondary }]}>
                    {budget ? `THIS ${budget.period.toUpperCase()}` : 'ALL RECORDED EXPENSES'}
                  </Text>
                </View>
                <Text style={styles.sectionTotal}>{formatCurrency(totalSpent)}</Text>
              </View>

              <PressableScale
                accessibilityRole="button"
                onPress={() => {
                  setNotice(null);
                  openNewExpense();
                }}
                style={styles.addExpenseButton}>
                <Text style={styles.addExpensePlus}>+</Text>
                <Text style={styles.addExpenseText}>Add expense</Text>
              </PressableScale>

              <View style={styles.historyHeader}>
                <Text style={[styles.historyTitle, { color: theme.text }]}>Expense history</Text>
                <Text style={[styles.historyCount, { color: theme.textSecondary }]}>
                  {expenses.length} {expenses.length === 1 ? 'ENTRY' : 'ENTRIES'}
                </Text>
              </View>

              {sortedExpenses.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryTitle}>Your spending starts here.</Text>
                  <Text style={styles.emptyHistoryCopy}>
                    Add each café purchase manually. Nothing is charged or imported automatically.
                  </Text>
                </View>
              ) : (
                <View style={styles.historyCard}>
                  {sortedExpenses.map((expense, index) => (
                    <View
                      key={expense.id}
                      style={[styles.expenseRow, index > 0 && styles.rowDivider]}>
                      <View style={styles.expenseMark}>
                        <Text style={styles.expenseMarkText}>A</Text>
                      </View>
                      <View style={styles.expenseCopy}>
                        <Text numberOfLines={1} style={[styles.expenseName, { color: theme.text }]}>
                          {expense.description}
                        </Text>
                        <Text style={[styles.expenseDate, { color: theme.textSecondary }]}>
                          {expense.date}
                        </Text>
                      </View>
                      <View style={styles.expenseActions}>
                        <Text style={styles.expenseAmount}>−{formatCurrency(expense.amount)}</Text>
                        <View style={styles.rowActions}>
                          <Pressable
                            accessibilityLabel={`Edit ${expense.description}`}
                            accessibilityRole="button"
                            hitSlop={8}
                            onPress={() => openExpenseForEdit(expense)}>
                            <Text style={styles.rowActionText}>EDIT</Text>
                          </Pressable>
                          <Pressable
                            accessibilityLabel={`Delete ${expense.description}`}
                            accessibilityRole="button"
                            hitSlop={8}
                            onPress={() => setConfirmDelete(expense)}>
                            <Text style={styles.deleteActionText}>DELETE</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>A café pick that fits</Text>
              </View>
              <MenuRecommendation
                name="Café latte"
                description="A familiar favourite for your next campus break."
                price={15}
              />
              <Text style={[styles.demoNote, { color: theme.textSecondary }]}>
                Your entries stay on this device. No bank, payment, or café account is connected.
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      <ExpenseFormModal
        amount={expenseAmount}
        date={expenseDate}
        description={expenseDescription}
        error={expenseFormError}
        isOpen={expenseModalOpen}
        isSaving={isSaving}
        onAmountChange={setExpenseAmount}
        onCancel={() => setExpenseModalOpen(false)}
        onDateChange={setExpenseDate}
        onDescriptionChange={setExpenseDescription}
        onSave={handleSaveExpense}
        title={editingExpense ? 'Edit expense' : 'Add expense'}
      />

      <ConfirmDeleteModal
        expense={confirmDelete}
        isDeleting={isSaving}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDeleteExpense}
      />
    </SafeAreaView>
  );
}

function ExpenseFormModal({
  amount,
  date,
  description,
  error,
  isOpen,
  isSaving,
  onAmountChange,
  onCancel,
  onDateChange,
  onDescriptionChange,
  onSave,
  title,
}: {
  amount: string;
  date: string;
  description: string;
  error: string | null;
  isOpen: boolean;
  isSaving: boolean;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onDateChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
  title: string;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onCancel} transparent visible={isOpen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}>
        <ScrollView
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.modalCard}>
            <Text style={styles.modalEyebrow}>ALTITUDE COFFEE</Text>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSubtitle}>Manually record a café purchase in AED.</Text>

            <Text style={styles.inputLabel}>AMOUNT · AED</Text>
            <View style={styles.amountInputWrap}>
              <Text style={styles.currencyPrefix}>AED</Text>
              <TextInput
                accessibilityLabel="Expense amount in AED"
                autoFocus={false}
                keyboardType="decimal-pad"
                onChangeText={onAmountChange}
                placeholder="0.00"
                placeholderTextColor="#A99C91"
                returnKeyType="done"
                style={styles.amountInput}
                value={amount}
              />
            </View>

            <Text style={styles.inputLabel}>MENU ITEM OR DESCRIPTION</Text>
            <TextInput
              accessibilityLabel="Menu item or purchase description"
              maxLength={80}
              onChangeText={onDescriptionChange}
              placeholder="e.g. Iced latte"
              placeholderTextColor="#A99C91"
              returnKeyType="done"
              style={styles.textInput}
              value={description}
            />

            <Text style={styles.inputLabel}>DATE · YYYY-MM-DD</Text>
            <TextInput
              accessibilityLabel="Purchase date in year-month-day format"
              onChangeText={onDateChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A99C91"
              returnKeyType="done"
              style={styles.textInput}
              value={date}
            />
            <Text style={styles.dateHint}>Defaults to today. Use the date printed on your receipt.</Text>

            {error && <Text accessibilityRole="alert" style={styles.formError}>{error}</Text>}

            <View style={styles.formActions}>
              <PressableScale accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>CANCEL</Text>
              </PressableScale>
              <PressableScale
                accessibilityRole="button"
                disabled={isSaving}
                onPress={onSave}
                style={[styles.primaryButton, isSaving && styles.disabledButton]}>
                <Text style={styles.primaryButtonText}>{isSaving ? 'SAVING…' : 'SAVE EXPENSE'}</Text>
              </PressableScale>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ConfirmDeleteModal({
  expense,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  expense: Expense | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={expense !== null}>
      <View style={styles.modalBackdrop}>
        <View style={styles.confirmCard}>
          <Text style={styles.modalEyebrow}>REMOVE ENTRY</Text>
          <Text style={styles.confirmTitle}>Delete this expense?</Text>
          <Text style={styles.confirmCopy}>
            {expense?.description} · {expense ? formatCurrency(expense.amount) : ''}
          </Text>
          <View style={styles.formActions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>KEEP IT</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isDeleting}
              onPress={onConfirm}
              style={[styles.deleteButton, isDeleting && styles.disabledButton]}>
              <Text style={styles.deleteButtonText}>{isDeleting ? 'DELETING…' : 'DELETE'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 112,
  },
  content: {
    width: '100%',
    maxWidth: 560,
  },
  header: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    color: cafeConfig.theme.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  intro: {
    paddingTop: 25,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    marginTop: 8,
    fontFamily: Fonts.serif,
    fontSize: 29,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
  },
  planCard: {
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.primary,
    ...Elevation.card,
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  planLabel: {
    color: '#F1E2D2',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  editBudgetText: {
    color: '#E8C9A6',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  amountLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 13,
  },
  remainingAmount: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  leftLabel: {
    color: '#F1E2D2',
    fontSize: 12,
  },
  progressTrack: {
    marginTop: 17,
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: 14,
    backgroundColor: cafeConfig.theme.surface,
  },
  infoMark: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: cafeConfig.theme.tint,
  },
  infoMarkText: {
    color: cafeConfig.theme.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  emptyPlanCard: {
    ...CardTokens,
    padding: 18,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
  },
  emptyPlanTitle: {
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 18,
  },
  emptyPlanCopy: {
    marginTop: 6,
    color: cafeConfig.theme.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  formCard: {
    marginTop: 14,
    ...CardTokens,
    padding: 17,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  formTitle: {
    marginBottom: 15,
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 19,
  },
  inputLabel: {
    marginBottom: 7,
    color: cafeConfig.theme.textSecondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  amountInputWrap: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  currencyPrefix: {
    color: cafeConfig.theme.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  amountInput: {
    flex: 1,
    paddingVertical: 10,
    color: cafeConfig.theme.text,
    fontSize: 15,
  },
  periodLabel: {
    marginTop: 15,
  },
  periodOptions: {
    flexDirection: 'row',
    gap: 9,
  },
  periodOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ButtonTokens.minHeight,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.small,
    backgroundColor: '#FFFFFF',
  },
  periodOptionSelected: {
    borderColor: cafeConfig.theme.primary,
    backgroundColor: cafeConfig.theme.tint,
  },
  periodOptionText: {
    color: cafeConfig.theme.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  periodOptionTextSelected: {
    color: cafeConfig.theme.primary,
    fontWeight: '800',
  },
  formError: {
    marginTop: 10,
    color: '#A13B2A',
    fontSize: 11,
    lineHeight: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 9,
    marginTop: 16,
  },
  primaryButton: {
    minHeight: ButtonTokens.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: ButtonTokens.borderRadius,
    backgroundColor: cafeConfig.theme.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  secondaryButton: {
    minHeight: ButtonTokens.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: ButtonTokens.borderRadius,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: cafeConfig.theme.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  deleteButton: {
    minHeight: ButtonTokens.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: ButtonTokens.borderRadius,
    backgroundColor: '#A13B2A',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  disabledButton: {
    opacity: 0.6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 26,
    marginBottom: 11,
  },
  sectionHeadingCopy: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '500',
  },
  sectionCaption: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sectionTotal: {
    color: cafeConfig.theme.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  addExpenseButton: {
    minHeight: ButtonTokens.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.small,
    backgroundColor: cafeConfig.theme.logoNavy,
  },
  addExpensePlus: {
    marginTop: -2,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
  },
  addExpenseText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyCount: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  emptyHistory: {
    padding: 17,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: 14,
    backgroundColor: cafeConfig.theme.surface,
  },
  emptyHistoryTitle: {
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 16,
  },
  emptyHistoryCopy: {
    marginTop: 5,
    color: cafeConfig.theme.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
  historyCard: {
    ...CardTokens,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  expenseRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cafeConfig.theme.border,
  },
  expenseMark: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: cafeConfig.theme.tint,
  },
  expenseMarkText: {
    color: cafeConfig.theme.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  expenseCopy: {
    flex: 1,
    minWidth: 70,
  },
  expenseName: {
    fontSize: 11,
    fontWeight: '700',
  },
  expenseDate: {
    marginTop: 4,
    fontSize: 9,
  },
  expenseActions: {
    alignItems: 'flex-end',
    gap: 5,
  },
  expenseAmount: {
    color: cafeConfig.theme.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
  },
  rowActionText: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deleteActionText: {
    color: '#A13B2A',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoNote: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    padding: 12,
    borderRadius: 9,
    backgroundColor: '#F6E5E1',
  },
  errorText: {
    flex: 1,
    color: '#7C2C20',
    fontSize: 10,
    lineHeight: 15,
  },
  retryButton: {
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  retryText: {
    color: '#7C2C20',
    fontSize: 8,
    fontWeight: '800',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    padding: 11,
    borderRadius: 8,
    backgroundColor: '#E7F0E7',
  },
  successText: {
    flex: 1,
    color: '#315B37',
    fontSize: 10,
    fontWeight: '600',
  },
  dismissText: {
    color: '#315B37',
    fontSize: 17,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: 'rgba(30,24,19,0.52)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.cream,
    ...Elevation.hero,
  },
  modalEyebrow: {
    color: cafeConfig.theme.accent,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  modalTitle: {
    marginTop: 7,
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 24,
  },
  modalSubtitle: {
    marginTop: 4,
    marginBottom: 18,
    color: cafeConfig.theme.textSecondary,
    fontSize: 11,
  },
  textInput: {
    minHeight: 45,
    marginBottom: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    color: cafeConfig.theme.text,
    fontSize: 12,
  },
  dateHint: {
    marginTop: -8,
    color: cafeConfig.theme.textSecondary,
    fontSize: 9,
    lineHeight: 14,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: cafeConfig.theme.cream,
  },
  confirmTitle: {
    marginTop: 9,
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 21,
  },
  confirmCopy: {
    marginTop: 7,
    color: cafeConfig.theme.textSecondary,
    fontSize: 11,
  },
});
