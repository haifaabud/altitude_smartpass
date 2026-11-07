import { Image, StyleSheet, Text, View } from 'react-native';

import { cafeConfig } from '@/constants/cafe-config';

type AltitudeBrandProps = {
  color?: string;
};

export function AltitudeBrand({ color = cafeConfig.theme.primary }: AltitudeBrandProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoFrame}>
        <Image
          accessibilityLabel="Altitude Coffee logo"
          resizeMode="contain"
          source={require('@/assets/images/altitude-coffee-logo.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.wordmark}>
        <Text style={[styles.name, { color }]}>COFFEE</Text>
        <Text style={styles.caption}>RIT STUDENT CAFÉ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoFrame: {
    width: 48,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: cafeConfig.theme.border,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 45,
    height: 42,
  },
  wordmark: {
    gap: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  caption: {
    color: cafeConfig.theme.textSecondary,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
});
