import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AltitudeBrand } from '@/components/altitude-brand';
import { AnimatedEntrance } from '@/components/animated-entrance';
import { AnimatedProgressBar } from '@/components/animated-progress-bar';
import { cafeConfig } from '@/constants/cafe-config';
import { Elevation, Fonts, Radius } from '@/constants/theme';
import { useBudget } from '@/contexts/budget-context';
import type { RewardEvent } from '@/utils/budget';
import { getPendingPeriodBonus, getRewardTotals } from '@/utils/rewards';

export default function RewardsScreen() {
  const { budget, expenses, rewardEvents, periodBudgets, completedPeriods } = useBudget();
  const [howRewardsOpen, setHowRewardsOpen] = useState(false);
  const rewardData = { budget, expenses, rewardEvents, periodBudgets, completedPeriods };
  const { totalPoints, purchasePoints, responsibleSpendingPoints } = getRewardTotals(rewardEvents);
  const pendingBonus = getPendingPeriodBonus(rewardData, budget, cafeConfig.loyalty);
  const recentRewardEvents = useMemo(
    () =>
      [...rewardEvents].sort(
        (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
      ),
    [rewardEvents],
  );
  const expensesById = useMemo(
    () => new Map(expenses.map((expense) => [expense.id, expense])),
    [expenses],
  );
  const rewardProgress = Math.min(totalPoints / cafeConfig.loyalty.rewardThreshold, 1);
  const pointsNeeded = Math.max(cafeConfig.loyalty.rewardThreshold - totalPoints, 0);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AltitudeBrand />
            <Text style={styles.badge}>LOCAL LOYALTY</Text>
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>A LITTLE SOMETHING EXTRA</Text>
            <Text style={styles.title}>Good coffee adds up.</Text>
            <Text style={styles.subtitle}>
              Collect points with the Altitude drinks and bites you already enjoy.
            </Text>
          </View>

          <AnimatedEntrance style={styles.pointsCard}>
            <View style={styles.pointsHeading}>
              <View style={styles.starMark}>
                <Text style={styles.star}>★</Text>
              </View>
              <Text style={styles.pointsEyebrow}>YOUR CAFÉ POINTS</Text>
            </View>
            <View style={styles.pointsLine}>
              <Text style={styles.pointsAmount}>{totalPoints}</Text>
              <Text style={styles.pointsUnit}>points</Text>
            </View>
            <Text style={styles.pointsCaption}>Earned from qualifying demo reward events</Text>
            <AnimatedProgressBar
              label={`${totalPoints} of ${cafeConfig.loyalty.rewardThreshold} points toward a café reward`}
              progress={rewardProgress * 100}
              color="#D5B18C"
              trackColor="rgba(255,255,255,0.24)"
              style={styles.progressTrack}
            />
            <View style={styles.progressCaptionRow}>
              <Text style={styles.progressCaption}>
                {totalPoints} / {cafeConfig.loyalty.rewardThreshold} points
              </Text>
              <Text style={styles.progressCaption}>
                {pointsNeeded === 0 ? 'Milestone reached' : `${pointsNeeded} to go`}
              </Text>
            </View>
            <View style={styles.earnedBreakdown}>
              <View style={styles.earnedMetric}>
                <Text style={styles.earnedValue}>{purchasePoints}</Text>
                <Text style={styles.earnedLabel}>PURCHASE</Text>
              </View>
              <View style={styles.earnedDivider} />
              <View style={styles.earnedMetric}>
                <Text style={styles.earnedValue}>{responsibleSpendingPoints}</Text>
                <Text style={styles.earnedLabel}>PERIOD BONUS</Text>
              </View>
            </View>
          </AnimatedEntrance>

          <AnimatedEntrance style={styles.earnCard}>
            <Text style={styles.earnTitle}>Two ways to earn.</Text>
            <Text style={styles.earnBody}>
              Purchase points are fixed per qualifying entry. A separate period bonus is earned
              when your weekly or monthly plan ends within budget.
            </Text>
            <Text style={styles.pendingBonus}>
              {pendingBonus > 0
                ? `+${pendingBonus} points pending for this ${budget?.period ?? 'budget'} period`
                : budget
                  ? `No period bonus pending yet · ${budget.period} plan`
                  : 'Set a weekly or monthly plan to be eligible for a period bonus'}
            </Text>
          </AnimatedEntrance>

          <Pressable
            accessibilityRole="button"
            onPress={() => setHowRewardsOpen(true)}
            style={styles.howButton}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>i</Text>
            </View>
            <Text style={styles.howButtonText}>How Rewards Work</Text>
            <Text style={styles.howButtonArrow}>→</Text>
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your first café treat</Text>
            <Text style={styles.thresholdBadge}>
              {cafeConfig.loyalty.rewardThreshold} POINTS
            </Text>
          </View>
          <AnimatedEntrance style={styles.rewardCard}>
            <View style={styles.rewardIcon}>
              <Text style={styles.rewardIconText}>☕</Text>
            </View>
            <View style={styles.rewardCopy}>
              <Text style={styles.rewardTitle}>A brewed coffee, on us</Text>
              <Text style={styles.rewardDescription}>{cafeConfig.loyalty.rewardDescription}</Text>
            </View>
          </AnimatedEntrance>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rewards activity</Text>
            <Text style={styles.activityCount}>
              {recentRewardEvents.length} {recentRewardEvents.length === 1 ? 'ENTRY' : 'ENTRIES'}
            </Text>
          </View>
          <AnimatedEntrance style={styles.activityCard}>
            {recentRewardEvents.length > 0 ? (
              recentRewardEvents.map((event) => (
                <RewardActivityRow
                  key={event.id}
                  event={event}
                  expenseDescription={
                    event.expenseId ? expensesById.get(event.expenseId)?.description : undefined
                  }
                />
              ))
            ) : (
              <Text style={styles.emptyActivity}>
                Reward points and completed budget bonuses will appear here.
              </Text>
            )}
          </AnimatedEntrance>

          <Text style={styles.demoNote}>
            Points are estimated from manually recorded expenses and saved on this device. Rewards
            are not verified or redeemable in this demo.
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setHowRewardsOpen(false)}
        transparent
        visible={howRewardsOpen}>
        <Pressable
          accessibilityLabel="Close rewards explanation"
          accessibilityRole="button"
          onPress={() => setHowRewardsOpen(false)}
          style={styles.modalBackdrop}>
          <Pressable
            accessibilityViewIsModal
            onPress={(event) => event.stopPropagation()}
            style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeading}>
                <Text style={styles.modalEyebrow}>PROVISIONAL DEMO VALUES</Text>
                <Text style={styles.modalTitle}>How SmartPass Rewards Work</Text>
              </View>
              <Pressable
                accessibilityLabel="Close rewards explanation"
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => setHowRewardsOpen(false)}
                style={styles.modalClose}>
                <Text style={styles.modalCloseText}>×</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.ruleBlock}>
                <Text style={styles.ruleNumber}>01</Text>
                <View style={styles.ruleCopy}>
                  <Text style={styles.ruleTitle}>Budget-friendly purchases</Text>
                  <Text style={styles.ruleDescription}>
                    Earn a fixed {cafeConfig.loyalty.pointsPerQualifyingPurchase} points for an
                    eligible café purchase when it fits within your remaining budget before it is
                    recorded. Points are not based on the amount spent.
                  </Text>
                </View>
              </View>
              <View style={styles.ruleBlock}>
                <Text style={styles.ruleNumber}>02</Text>
                <View style={styles.ruleCopy}>
                  <Text style={styles.ruleTitle}>Responsible spending bonus</Text>
                  <Text style={styles.ruleDescription}>
                    Earn a separate {cafeConfig.loyalty.responsibleSpendingPeriodBonus}-point bonus
                    when a weekly or monthly budget period ends with spending within your limit and
                    at least one qualifying purchase.
                  </Text>
                </View>
              </View>
              <View style={styles.ruleNotes}>
                <Text style={styles.goodToKnowTitle}>GOOD TO KNOW</Text>
                <Text style={styles.ruleNote}>
                  • Purchase rewards are limited to{' '}
                  {cafeConfig.loyalty.maxQualifyingPurchaseRewardsPerDay} qualifying purchase per
                  day.
                </Text>
                <Text style={styles.ruleNote}>
                  • Purchase points are not removed if you later exceed your budget.
                </Text>
                <Text style={styles.ruleNote}>
                  • Period bonuses are calculated separately at the end of the selected period.
                </Text>
                <Text style={styles.ruleNote}>
                  • You can still record a purchase above your remaining amount; it simply will not
                  earn purchase points.
                </Text>
              </View>
              <Text style={styles.transparencyNotice}>
                In this demo, expenses are manually recorded, so reward calculations are estimates.
                Verified purchases and actual reward redemption would require future Altitude
                POS/MOBIPOS integration.
              </Text>
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              onPress={() => setHowRewardsOpen(false)}
              style={styles.modalDoneButton}>
              <Text style={styles.modalDoneText}>GOT IT</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function RewardActivityRow({
  event,
  expenseDescription,
}: {
  event: RewardEvent;
  expenseDescription?: string;
}) {
  const isPurchase = event.type === 'purchase';
  const title = event.active
    ? isPurchase
      ? expenseDescription ?? 'Budget-friendly café purchase'
      : `${event.periodKey?.split(':')[0] ?? 'Budget'} plan bonus`
    : isPurchase
      ? 'Purchase reward removed'
      : 'Period bonus removed';
  const detail = event.active
    ? isPurchase
      ? 'Qualifying purchase'
      : 'Completed within your spending plan'
    : 'Reward no longer counts toward your points';

  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityMark, !event.active && styles.activityMarkInactive]}>
        <Text style={[styles.activityMarkText, !event.active && styles.activityTextInactive]}>
          {isPurchase ? 'P' : 'B'}
        </Text>
      </View>
      <View style={styles.activityCopy}>
        <Text numberOfLines={1} style={[styles.activityTitle, !event.active && styles.activityTextInactive]}>
          {title}
        </Text>
        <Text style={styles.activityDetail}>
          {formatActivityDate(event.date)} · {detail}
        </Text>
      </View>
      <Text style={[styles.activityPoints, !event.active && styles.activityTextInactive]}>
        {event.active ? '+' : '−'}{event.points}
      </Text>
    </View>
  );
}

function formatActivityDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('en-AE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cafeConfig.theme.cream,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    color: cafeConfig.theme.logoNavy,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  intro: {
    paddingTop: 25,
    paddingBottom: 20,
  },
  eyebrow: {
    color: cafeConfig.theme.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 8,
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.4,
  },
  subtitle: {
    maxWidth: 330,
    marginTop: 6,
    color: cafeConfig.theme.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  pointsCard: {
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.logoNavy,
    ...Elevation.card,
  },
  pointsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  starMark: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  star: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  pointsEyebrow: {
    color: '#E8EDF4',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  pointsLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 13,
  },
  pointsAmount: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  pointsUnit: {
    color: '#E8EDF4',
    fontSize: 13,
  },
  pointsCaption: {
    marginTop: 1,
    color: '#E8EDF4',
    fontSize: 11,
  },
  progressTrack: {
    marginTop: 20,
  },
  progressCaptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 9,
  },
  progressCaption: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  earnedBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  earnedMetric: {
    flex: 1,
  },
  earnedValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  earnedLabel: {
    marginTop: 3,
    color: '#E8EDF4',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  earnedDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  earnCard: {
    marginTop: 14,
    padding: 16,
    borderLeftWidth: 2,
    borderLeftColor: cafeConfig.theme.accent,
    borderRadius: 4,
    backgroundColor: cafeConfig.theme.tint,
  },
  earnTitle: {
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 16,
  },
  earnBody: {
    marginTop: 5,
    color: cafeConfig.theme.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },
  pendingBonus: {
    marginTop: 10,
    color: cafeConfig.theme.primary,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 15,
  },
  howButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.medium,
    backgroundColor: cafeConfig.theme.surface,
  },
  infoIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: cafeConfig.theme.logoNavy,
    borderRadius: 10,
  },
  infoIconText: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 12,
    fontWeight: '700',
  },
  howButtonText: {
    flex: 1,
    color: cafeConfig.theme.logoNavy,
    fontSize: 12,
    fontWeight: '700',
  },
  howButtonArrow: {
    color: cafeConfig.theme.accent,
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 27,
    marginBottom: 11,
  },
  sectionTitle: {
    flexShrink: 1,
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 18,
  },
  thresholdBadge: {
    color: cafeConfig.theme.accent,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  rewardCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: cafeConfig.theme.tint,
  },
  rewardIconText: {
    fontSize: 19,
  },
  rewardCopy: {
    flex: 1,
    marginLeft: 12,
  },
  rewardTitle: {
    color: cafeConfig.theme.text,
    fontSize: 12,
    fontWeight: '700',
  },
  rewardDescription: {
    marginTop: 4,
    color: cafeConfig.theme.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
  activityCount: {
    color: cafeConfig.theme.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  activityCard: {
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  activityRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cafeConfig.theme.border,
  },
  activityMark: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: cafeConfig.theme.tint,
  },
  activityMarkInactive: {
    backgroundColor: cafeConfig.theme.cream,
  },
  activityMarkText: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 10,
    fontWeight: '800',
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    color: cafeConfig.theme.text,
    fontSize: 11,
    fontWeight: '700',
  },
  activityDetail: {
    marginTop: 4,
    color: cafeConfig.theme.textSecondary,
    fontSize: 9,
    lineHeight: 13,
  },
  activityPoints: {
    color: cafeConfig.theme.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  activityTextInactive: {
    color: cafeConfig.theme.textSecondary,
  },
  emptyActivity: {
    paddingVertical: 19,
    color: cafeConfig.theme.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },
  demoNote: {
    marginTop: 18,
    color: cafeConfig.theme.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(30, 24, 20, 0.48)',
  },
  modalCard: {
    maxHeight: '88%',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 26,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: cafeConfig.theme.cream,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalHeading: {
    flex: 1,
    paddingRight: 12,
  },
  modalEyebrow: {
    color: cafeConfig.theme.accent,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  modalTitle: {
    marginTop: 7,
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 23,
    lineHeight: 28,
  },
  modalClose: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: cafeConfig.theme.tint,
  },
  modalCloseText: {
    marginTop: -2,
    color: cafeConfig.theme.text,
    fontSize: 24,
    lineHeight: 28,
  },
  ruleBlock: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cafeConfig.theme.border,
  },
  ruleNumber: {
    width: 38,
    color: cafeConfig.theme.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  ruleCopy: {
    flex: 1,
  },
  ruleTitle: {
    color: cafeConfig.theme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  ruleDescription: {
    marginTop: 5,
    color: cafeConfig.theme.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },
  ruleNotes: {
    gap: 8,
    marginTop: 4,
    padding: 14,
    borderRadius: Radius.medium,
    backgroundColor: cafeConfig.theme.surface,
  },
  goodToKnowTitle: {
    marginBottom: 2,
    color: cafeConfig.theme.accent,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  ruleNote: {
    color: cafeConfig.theme.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
  transparencyNotice: {
    marginTop: 14,
    padding: 13,
    borderLeftWidth: 2,
    borderLeftColor: cafeConfig.theme.accent,
    backgroundColor: cafeConfig.theme.tint,
    color: cafeConfig.theme.text,
    fontSize: 10,
    lineHeight: 16,
  },
  modalDoneButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderRadius: Radius.medium,
    backgroundColor: cafeConfig.theme.logoNavy,
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
