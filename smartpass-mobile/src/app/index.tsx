import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AltitudeBrand } from '@/components/altitude-brand';
import { AnimatedEntrance } from '@/components/animated-entrance';
import { AnimatedProgressBar } from '@/components/animated-progress-bar';
import { CoffeeEditorialHero } from '@/components/coffee-editorial-hero';
import { MenuRecommendation } from '@/components/menu-recommendation';
import { PressableScale } from '@/components/pressable-scale';
import { cafeConfig, formatCurrency } from '@/constants/cafe-config';
import { ButtonTokens, Elevation, Fonts, Radius } from '@/constants/theme';
import { useBudget } from '@/contexts/budget-context';
import { useTheme } from '@/hooks/use-theme';
import {
  getPeriodExpenses,
  getRemainingBudget,
  getSpentPercentage,
  getTotalSpent,
} from '@/utils/budget';

export default function HomeScreen() {
  const theme = useTheme();
  const { budget, expenses, isLoaded } = useBudget();
  const activePeriod = budget?.period ?? 'monthly';
  const periodExpenses = useMemo(
    () => getPeriodExpenses(expenses, activePeriod),
    [activePeriod, expenses],
  );
  const totalSpent = getTotalSpent(periodExpenses);
  const remainingBudget = budget ? getRemainingBudget(budget, periodExpenses) : 0;
  const spentPercentage = budget ? getSpentPercentage(budget, periodExpenses) : 0;
  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    [expenses],
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AltitudeBrand color={theme.text} />
            <Text style={styles.demoBadge}>PERSONAL PLAN</Text>
          </View>

          <View style={styles.greeting}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>A GOOD DAY STARTS HERE</Text>
            <Text style={[styles.title, { color: theme.text }]}>Welcome back, Alex.</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Your Altitude café routine, thoughtfully in reach.
            </Text>
          </View>

          <CoffeeEditorialHero
            eyebrow="YOUR CAMPUS COFFEE RITUAL"
            title={'Make room\nfor a good cup.'}
            description="A little pause, made beautifully."
            stamp="RIT DUBAI · COFFEE BAR"
          />

          {budget ? (
            <AnimatedEntrance style={styles.budgetCard}>
              <View style={styles.budgetTopLine}>
                <Text style={styles.cardEyebrow}>YOUR PERSONAL CAFÉ PLAN</Text>
                <Text style={styles.periodLabel}>THIS {budget.period.toUpperCase()}</Text>
              </View>
              <View style={styles.amountLine}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={styles.budgetAmount}>
                  {formatCurrency(remainingBudget)}
                </Text>
                <Text style={styles.budgetOf}>remaining</Text>
              </View>
              <AnimatedProgressBar
                label={`${Math.round(spentPercentage)} percent of your ${budget.period} café plan used`}
                progress={spentPercentage}
                color="#D5B18C"
                trackColor="rgba(255,255,255,0.22)"
                style={styles.progressTrack}
              />
              <View style={styles.budgetFooter}>
                <Text style={styles.budgetFootnote}>{formatCurrency(totalSpent)} spent</Text>
                <Text style={styles.budgetFootnote}>{formatCurrency(budget.amount)} plan</Text>
              </View>
              <Text style={styles.budgetNote}>
                Your guide for café spending, not money stored in SmartPass.
              </Text>
            </AnimatedEntrance>
          ) : isLoaded ? (
            <Link href="/budget" asChild>
              <PressableScale accessibilityRole="link" style={styles.noBudgetCard}>
                <Text style={styles.noBudgetEyebrow}>YOUR PERSONAL CAFÉ PLAN</Text>
                <Text style={styles.noBudgetTitle}>Set a budget that feels right.</Text>
                <Text style={styles.noBudgetLink}>SET MY PLAN  →</Text>
              </PressableScale>
            </Link>
          ) : (
            <View style={styles.noBudgetCard}>
              <Text style={styles.noBudgetTitle}>Loading your saved café plan…</Text>
            </View>
          )}

          {isLoaded && (
            <Link href="/budget" asChild>
              <PressableScale accessibilityRole="link" style={styles.quickAddButton}>
                <Text style={styles.quickAddPlus}>+</Text>
                <Text style={styles.quickAddText}>Manage spending</Text>
                <Text style={styles.quickAddHint}>BUDGET & EXPENSES</Text>
              </PressableScale>
            </Link>
          )}

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Something good, on plan</Text>
            <Link href="/menu" style={styles.sectionLink}>MENU</Link>
          </View>
          <MenuRecommendation
            name="Americano"
            description="A smooth classic for your next campus break."
            price={10}
          />

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent at the café</Text>
            <Link href="/budget" style={styles.sectionLink}>ALL EXPENSES</Link>
          </View>
          <AnimatedEntrance style={styles.activityCard}>
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense, index) => (
                <View
                  key={expense.id}
                  style={[styles.purchaseRow, index > 0 && styles.purchaseRowBorder]}>
                  <View style={styles.purchaseMark}>
                    <Text style={styles.purchaseMarkText}>A</Text>
                  </View>
                  <View style={styles.purchaseInfo}>
                    <Text style={[styles.purchaseName, { color: theme.text }]}>
                      {expense.description}
                    </Text>
                    <Text style={[styles.purchaseDetail, { color: theme.textSecondary }]}>
                      {expense.date} · Altitude Coffee
                    </Text>
                  </View>
                  <Text style={[styles.purchaseAmount, { color: theme.text }]}>
                    −{formatCurrency(expense.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyActivity, { color: theme.textSecondary }]}>
                Your manually recorded café expenses will appear here.
              </Text>
            )}
          </AnimatedEntrance>

          <Link href="/rewards" asChild>
            <Text style={styles.rewardsPreview}>
              <Text style={styles.rewardsEyebrow}>ALTITUDE LOYALTY  ·  </Text>
              Budget-friendly purchases · responsible-spending bonus
              <Text style={styles.rewardsArrow}>   VIEW REWARDS  →</Text>
            </Text>
          </Link>

          <Text style={[styles.footerNote, { color: theme.textSecondary }]}>
            Altitude Coffee · SmartPass demo experience
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  demoBadge: {
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: cafeConfig.theme.tint,
    color: cafeConfig.theme.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  noBudgetCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  noBudgetEyebrow: {
    color: cafeConfig.theme.accent,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  noBudgetTitle: {
    marginTop: 8,
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 20,
  },
  noBudgetLink: {
    marginTop: 12,
    color: cafeConfig.theme.logoNavy,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  quickAddButton: {
    minHeight: ButtonTokens.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: ButtonTokens.borderRadius,
    backgroundColor: cafeConfig.theme.logoNavy,
  },
  quickAddPlus: {
    marginTop: -2,
    color: '#FFFFFF',
    fontSize: 21,
  },
  quickAddText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  quickAddHint: {
    color: '#DDE4EE',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  greeting: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  title: {
    marginTop: 7,
    fontFamily: Fonts.serif,
    fontSize: 30,
    fontWeight: '500',
    letterSpacing: -0.5,
    lineHeight: 37,
  },
  subtitle: {
    maxWidth: 300,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
  },
  budgetCard: {
    overflow: 'hidden',
    padding: 19,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.primary,
    ...Elevation.card,
  },
  budgetTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardEyebrow: {
    color: '#F6EBDD',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  periodLabel: {
    color: '#E1C5A8',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  amountLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
    marginTop: 15,
  },
  budgetAmount: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  budgetOf: {
    color: '#F0E2D3',
    fontSize: 12,
  },
  progressTrack: {
    height: 5,
    marginTop: 17,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 9,
  },
  budgetFootnote: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  budgetNote: {
    marginTop: 14,
    color: '#E7D7C6',
    fontSize: 9,
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 25,
    marginBottom: 11,
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '500',
  },
  sectionLink: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  sectionCaption: {
    color: cafeConfig.theme.accent,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activityCard: {
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  emptyActivity: {
    paddingVertical: 17,
    fontSize: 11,
    lineHeight: 16,
  },
  purchaseRow: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchaseRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cafeConfig.theme.border,
  },
  purchaseMark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: cafeConfig.theme.tint,
  },
  purchaseMarkText: {
    color: cafeConfig.theme.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  purchaseInfo: {
    flex: 1,
    marginLeft: 11,
  },
  purchaseName: {
    fontSize: 12,
    fontWeight: '700',
  },
  purchaseDetail: {
    marginTop: 3,
    fontSize: 9,
  },
  purchaseAmount: {
    fontSize: 11,
    fontWeight: '700',
  },
  rewardsPreview: {
    marginTop: 16,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#E8EDF4',
    color: cafeConfig.theme.logoNavy,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 19,
  },
  rewardsEyebrow: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  rewardsArrow: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  footerNote: {
    paddingTop: 22,
    paddingBottom: 7,
    textAlign: 'center',
    fontSize: 9,
  },
});
