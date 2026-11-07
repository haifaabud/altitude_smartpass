import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AltitudeBrand } from '@/components/altitude-brand';
import { AnimatedEntrance } from '@/components/animated-entrance';
import { PressableScale } from '@/components/pressable-scale';
import { cafeConfig, formatCurrency } from '@/constants/cafe-config';
import { Elevation, Fonts, Radius } from '@/constants/theme';
import { useBudget } from '@/contexts/budget-context';
import { useTheme } from '@/hooks/use-theme';

const sampleStudent = {
  name: 'Alex Morgan',
  initials: 'AM',
  campus: 'RIT Dubai',
};

export default function ProfileScreen() {
  const theme = useTheme();
  const { budget, expenses } = useBudget();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AltitudeBrand color={theme.text} />
            <Text style={styles.demoBadge}>DEMO PROFILE</Text>
          </View>

          <View style={styles.intro}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>YOUR SMARTPASS</Text>
            <Text style={[styles.title, { color: theme.text }]}>A little about you.</Text>
          </View>

          <AnimatedEntrance style={styles.identityCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{sampleStudent.initials}</Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={[styles.name, { color: theme.text }]}>{sampleStudent.name}</Text>
              <Text style={[styles.campus, { color: theme.textSecondary }]}>
                {sampleStudent.campus} · Student
              </Text>
            </View>
            <View style={styles.sampleMark}>
              <Text style={styles.sampleMarkText}>SAMPLE</Text>
            </View>
          </AnimatedEntrance>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your café plan</Text>
          </View>
          <AnimatedEntrance style={styles.planCard}>
            <View style={styles.planCopy}>
              <Text style={styles.planEyebrow}>
                {budget ? `PERSONAL ${budget.period.toUpperCase()} PLAN` : 'PERSONAL CAFÉ PLAN'}
              </Text>
              <Text style={styles.planAmount}>
                {budget ? formatCurrency(budget.amount) : 'Not set yet'}
              </Text>
              <Text style={styles.planCaption}>
                {budget
                  ? 'A guide for your café spending—not a wallet balance.'
                  : 'Choose a weekly or monthly spending guide.'}
              </Text>
            </View>
            <Link href="/budget" asChild>
              <PressableScale accessibilityRole="link" style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{budget ? 'VIEW PLAN' : 'SET PLAN'}</Text>
              </PressableScale>
            </Link>
          </AnimatedEntrance>
          <Text style={[styles.expenseCount, { color: theme.textSecondary }]}>
            {expenses.length} manually recorded {expenses.length === 1 ? 'expense' : 'expenses'}
          </Text>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore SmartPass</Text>
          </View>
          <AnimatedEntrance style={styles.linksCard}>
            <ProfileLink
              href="/rewards"
              title="Altitude rewards"
              description="Points from eligible café purchases"
              mark="★"
              theme={theme}
            />
            <View style={styles.divider} />
            <ProfileLink
              href="/menu"
              title="Café menu"
              description="Find your next campus coffee"
              mark="☕"
              theme={theme}
            />
          </AnimatedEntrance>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Café Connection</Text>
          </View>
          <AnimatedEntrance style={styles.connectionCard}>
            <View style={styles.connectionTopRow}>
              <Text style={styles.connectionEyebrow}>POS PROVIDER</Text>
              <Text style={styles.connectionProvider}>MOBIPOS</Text>
              <Text style={styles.connectionStatus}>PLANNED</Text>
            </View>
            <Text style={[styles.connectionCopy, { color: theme.textSecondary }]}>
              SmartPass aims to connect with Altitude&apos;s existing POS system.
            </Text>
            <View style={styles.connectionDivider} />
            <View style={styles.connectionSyncRow}>
              <Text style={styles.connectionSyncLabel}>Transaction synchronization</Text>
              <Text style={styles.connectionSyncValue}>Coming in a future update</Text>
            </View>
            <Text style={styles.connectionNote}>
              No live POS connection or transaction synchronization is active.
            </Text>
          </AnimatedEntrance>

          <AnimatedEntrance style={styles.aboutCard}>
            <Text style={[styles.aboutTitle, { color: theme.text }]}>Made for your coffee break.</Text>
            <Text style={[styles.aboutCopy, { color: theme.textSecondary }]}>
              SmartPass brings your Altitude Coffee menu, personal plan, and café loyalty in one
              place.
            </Text>
            <View style={styles.aboutFooter}>
              <Text style={styles.aboutBrand}>ALTITUDE COFFEE</Text>
              <Text style={styles.version}>SMARTPASS · DEMO</Text>
            </View>
          </AnimatedEntrance>

          <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
            Sample profile only. Account details and preferences are not connected or saved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileLink({
  href,
  title,
  description,
  mark,
  theme,
}: {
  href: '/rewards' | '/menu';
  title: string;
  description: string;
  mark: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Link href={href} asChild>
      <PressableScale accessibilityRole="link" style={styles.linkRow}>
        <View style={styles.linkMark}>
          <Text style={styles.linkMarkText}>{mark}</Text>
        </View>
        <View style={styles.linkCopy}>
          <Text style={[styles.linkTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.linkDescription, { color: theme.textSecondary }]}>
            {description}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </PressableScale>
    </Link>
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
    color: cafeConfig.theme.logoNavy,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  intro: {
    paddingTop: 25,
    paddingBottom: 19,
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
  identityCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: cafeConfig.theme.logoNavy,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  identityCopy: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  campus: {
    marginTop: 4,
    fontSize: 11,
  },
  sampleMark: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: cafeConfig.theme.tint,
  },
  sampleMarkText: {
    color: cafeConfig.theme.primary,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginTop: 25,
    marginBottom: 11,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '500',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 17,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.primary,
    ...Elevation.card,
  },
  planCopy: {
    flex: 1,
  },
  planEyebrow: {
    color: '#E8D6C3',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  planAmount: {
    marginTop: 7,
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '700',
  },
  planCaption: {
    maxWidth: 215,
    marginTop: 4,
    color: '#E8D6C3',
    fontSize: 9,
    lineHeight: 14,
  },
  expenseCount: {
    marginTop: 9,
    marginLeft: 2,
    fontSize: 9,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  actionButtonText: {
    color: cafeConfig.theme.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  linksCard: {
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  linkRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkMark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#E8EDF4',
  },
  linkMarkText: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 15,
    fontWeight: '700',
  },
  linkCopy: {
    flex: 1,
    marginLeft: 11,
  },
  linkTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  linkDescription: {
    marginTop: 3,
    fontSize: 10,
  },
  chevron: {
    paddingHorizontal: 4,
    color: cafeConfig.theme.accent,
    fontSize: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: cafeConfig.theme.border,
  },
  connectionCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  connectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  connectionEyebrow: {
    color: cafeConfig.theme.textSecondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  connectionProvider: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  connectionStatus: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.small,
    backgroundColor: cafeConfig.theme.tint,
    color: cafeConfig.theme.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  connectionCopy: {
    marginTop: 11,
    fontSize: 11,
    lineHeight: 17,
  },
  connectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 13,
    marginBottom: 11,
    backgroundColor: cafeConfig.theme.border,
  },
  connectionSyncRow: {
    gap: 4,
  },
  connectionSyncLabel: {
    color: cafeConfig.theme.text,
    fontSize: 10,
    fontWeight: '700',
  },
  connectionSyncValue: {
    color: cafeConfig.theme.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  connectionNote: {
    marginTop: 10,
    color: cafeConfig.theme.textSecondary,
    fontSize: 9,
    lineHeight: 14,
  },
  aboutCard: {
    marginTop: 23,
    padding: 17,
    borderLeftWidth: 2,
    borderLeftColor: cafeConfig.theme.logoNavy,
    borderRadius: 4,
    backgroundColor: '#E8EDF4',
  },
  aboutTitle: {
    fontFamily: Fonts.serif,
    fontSize: 16,
  },
  aboutCopy: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
  },
  aboutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D5DDE8',
  },
  aboutBrand: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  version: {
    color: cafeConfig.theme.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disclaimer: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 9,
    lineHeight: 14,
  },
});
