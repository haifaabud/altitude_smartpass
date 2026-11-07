import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { cafeConfig } from '@/constants/cafe-config';
import { Fonts, Radius } from '@/constants/theme';

type CoffeeEditorialHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  stamp?: string;
};

const entrance = FadeInDown.duration(440).delay(60);

export function CoffeeEditorialHero({
  eyebrow,
  title,
  description,
  stamp = 'A MOMENT ABOVE THE ORDINARY',
}: CoffeeEditorialHeroProps) {
  return (
    <Animated.View entering={entrance} style={styles.frame}>
      <Image
        accessibilityLabel="Freshly prepared Altitude Coffee"
        contentFit="cover"
        source={require('@/assets/images/altitude-coffee-editorial.jpg')}
        style={StyleSheet.absoluteFill}
        transition={250}
      />
      <View style={styles.scrim} />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.stamp}>
        <Text style={styles.stampTitle}>ALTITUDE</Text>
        <Text style={styles.stampDetail}>{stamp}</Text>
      </View>
      <View accessibilityElementsHidden style={styles.accentRule} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    minHeight: 238,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginTop: 16,
    borderRadius: Radius.hero,
    backgroundColor: cafeConfig.theme.primary,
    shadowColor: '#21170F',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.16,
    shadowRadius: 17,
    elevation: 4,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(25, 19, 15, 0.46)',
  },
  copy: {
    maxWidth: 300,
    paddingHorizontal: 21,
    paddingBottom: 19,
  },
  eyebrow: {
    color: '#F0D8B9',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  title: {
    marginTop: 9,
    color: '#FFFFFF',
    fontFamily: Fonts.serif,
    fontSize: 31,
    fontWeight: '500',
    letterSpacing: -0.5,
    lineHeight: 35,
  },
  description: {
    maxWidth: 250,
    marginTop: 6,
    color: '#F4ECE2',
    fontSize: 11,
    lineHeight: 16,
  },
  stamp: {
    position: 'absolute',
    top: 17,
    right: 16,
    alignItems: 'flex-end',
  },
  stampTitle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  stampDetail: {
    marginTop: 4,
    color: '#F0D8B9',
    fontSize: 6,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  accentRule: {
    position: 'absolute',
    left: 21,
    bottom: 13,
    width: 33,
    height: 2,
    borderRadius: 1,
    backgroundColor: cafeConfig.theme.accent,
  },
});
