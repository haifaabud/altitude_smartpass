import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AltitudeBrand } from '@/components/altitude-brand';
import { AnimatedEntrance } from '@/components/animated-entrance';
import { CoffeeBean } from '@/components/coffee-bean';
import { CoffeeEditorialHero } from '@/components/coffee-editorial-hero';
import { cafeConfig, formatCurrency } from '@/constants/cafe-config';
import { Fonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const espressoMenu = [
  { name: 'Single Espresso', price: 10 },
  { name: 'Double Espresso', price: 12 },
  { name: 'Americano', price: 10 },
  { name: 'Hot / Iced Coffee', price: 12 },
  { name: 'Cortado', price: 12 },
  { name: 'Piccolo', price: 14 },
  { name: 'Flat White', price: 14 },
  { name: 'Café Latte · Hot / Iced', price: 15 },
  { name: 'Raf Coffee', price: 15 },
  { name: 'Spanish Latte · Rose', price: 15 },
  { name: 'Spanish Latte · Spanish', price: 15 },
  { name: 'Saffron Latte · Pistachio', price: 15 },
  { name: 'Spanish Latte · Dark', price: 15 },
  { name: 'Caramel Latte · Nutella', price: 15 },
  { name: 'Latte · Iced Coffee', price: 15 },
  { name: 'Peanut Butter Latte', price: 15 },
];

const manualMenu = [
  { name: 'Aeropress · Hot / Iced', price: 15 },
  { name: 'V60 · Hot / Iced', price: 15 },
  { name: 'Chemex · Hot / Iced', price: 15 },
  { name: 'Iced Slow Drip', price: 15 },
];

export default function MenuScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AltitudeBrand color={theme.text} />
            <Text style={[styles.menuBadge, { color: theme.primary }]}>THE MENU</Text>
          </View>

          <CoffeeEditorialHero
            eyebrow="ALTITUDE COFFEE · RIT DUBAI"
            title={'The art of\na slower sip.'}
            description="Thoughtfully made, ready for your next campus break."
            stamp="BREWED WITH CARE"
          />

          <AnimatedEntrance>
            <MenuSection title="Espresso bar" items={espressoMenu} theme={theme} />
          </AnimatedEntrance>
          <AnimatedEntrance>
            <MenuSection title="Manual bar" items={manualMenu} theme={theme} />
          </AnimatedEntrance>

          <View style={styles.footer}>
            <View style={styles.footerBeans}>
              <CoffeeBean size={22} color="#74533D" seamColor="#E7CCAE" rotation="-36deg" />
              <CoffeeBean size={22} color={cafeConfig.theme.primary} seamColor="#E7CCAE" rotation="36deg" />
            </View>
            <Text style={[styles.footerText, { color: theme.text }]}>Made for your next coffee break.</Text>
            <Text style={[styles.demoNote, { color: theme.textSecondary }]}>Sample menu · Prices shown in AED</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuSection({
  title,
  items,
  theme,
}: {
  title: string;
  items: { name: string; price: number }[];
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={[styles.sectionMark, { backgroundColor: theme.backgroundSelected }]}>
          <CoffeeBean size={17} color={cafeConfig.theme.primary} seamColor="#E6D0B9" rotation="-24deg" />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <View style={[styles.menuCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {items.map((item, index) => (
          <View
            key={item.name}
            style={[styles.menuRow, index > 0 && styles.menuRowBorder, { borderTopColor: theme.border }]}>
            <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.itemPrice, { color: theme.primary }]}>{formatCurrency(item.price)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 36,
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
  menuBadge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  section: {
    marginTop: 23,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  sectionMark: {
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    fontWeight: '500',
  },
  menuCard: {
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
  menuRow: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  menuRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  itemName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 10,
  },
  footerBeans: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -3,
  },
  footerText: {
    marginTop: 6,
    fontFamily: Fonts.serif,
    fontSize: 13,
  },
  demoNote: {
    marginTop: 5,
    fontSize: 10,
  },
});
