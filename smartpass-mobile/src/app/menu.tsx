import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AltitudeBrand } from '@/components/altitude-brand';
import { AnimatedEntrance } from '@/components/animated-entrance';
import { CoffeeBean } from '@/components/coffee-bean';
import { CoffeeEditorialHero } from '@/components/coffee-editorial-hero';
import { cafeConfig, formatCurrency } from '@/constants/cafe-config';
import { Fonts, Radius } from '@/constants/theme';

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
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AltitudeBrand />
            <Text style={styles.menuBadge}>THE MENU</Text>
          </View>

          <CoffeeEditorialHero
            eyebrow="ALTITUDE COFFEE · RIT DUBAI"
            title={'The art of\na slower sip.'}
            description="Thoughtfully made, ready for your next campus break."
            stamp="BREWED WITH CARE"
          />

          <AnimatedEntrance>
            <MenuSection title="Espresso bar" items={espressoMenu} />
          </AnimatedEntrance>
          <AnimatedEntrance>
            <MenuSection title="Manual bar" items={manualMenu} />
          </AnimatedEntrance>

          <View style={styles.footer}>
            <View style={styles.footerBeans}>
              <CoffeeBean size={22} color="#74533D" seamColor="#E7CCAE" rotation="-36deg" />
              <CoffeeBean size={22} color={cafeConfig.theme.primary} seamColor="#E7CCAE" rotation="36deg" />
            </View>
            <Text style={styles.footerText}>Made for your next coffee break.</Text>
            <Text style={styles.demoNote}>Sample menu · Prices shown in AED</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuSection({
  title,
  items,
}: {
  title: string;
  items: { name: string; price: number }[];
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionMark}>
          <CoffeeBean size={17} color={cafeConfig.theme.primary} seamColor="#E6D0B9" rotation="-24deg" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.menuCard}>
        {items.map((item, index) => (
          <View key={item.name} style={[styles.menuRow, index > 0 && styles.menuRowBorder]}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cafeConfig.theme.cream,
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
    color: cafeConfig.theme.primary,
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
    backgroundColor: cafeConfig.theme.tint,
  },
  sectionTitle: {
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 17,
    fontWeight: '500',
  },
  menuCard: {
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.medium,
    backgroundColor: cafeConfig.theme.surface,
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
    borderTopColor: cafeConfig.theme.border,
  },
  itemName: {
    flex: 1,
    color: cafeConfig.theme.text,
    fontSize: 11,
    fontWeight: '500',
  },
  itemPrice: {
    color: cafeConfig.theme.primary,
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
    color: cafeConfig.theme.text,
    fontFamily: Fonts.serif,
    fontSize: 13,
  },
  demoNote: {
    marginTop: 5,
    color: cafeConfig.theme.textSecondary,
    fontSize: 10,
  },
});
