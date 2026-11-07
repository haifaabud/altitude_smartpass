import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { cafeConfig, formatCurrency } from '@/constants/cafe-config';
import { CardTokens, Elevation, Radius } from '@/constants/theme';
import { PressableScale } from '@/components/pressable-scale';

type MenuRecommendationProps = {
  name: string;
  description: string;
  price: number;
};

export function MenuRecommendation({ name, description, price }: MenuRecommendationProps) {
  return (
    <Link href="/menu" asChild>
      <PressableScale accessibilityRole="link" style={styles.card}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>A GOOD CUP, ON PLAN</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>{formatCurrency(price)}</Text>
          <Text style={styles.action}>VIEW MENU</Text>
        </View>
      </PressableScale>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    ...CardTokens,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: Radius.large,
    backgroundColor: cafeConfig.theme.surface,
    ...Elevation.card,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: cafeConfig.theme.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  name: {
    marginTop: 5,
    color: cafeConfig.theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    marginTop: 3,
    color: cafeConfig.theme.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: 9,
  },
  price: {
    color: cafeConfig.theme.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  action: {
    color: cafeConfig.theme.logoNavy,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
