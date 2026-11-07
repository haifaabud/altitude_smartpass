import { StyleSheet, View } from 'react-native';

import { cafeConfig } from '@/constants/cafe-config';

type CoffeeBeanProps = {
  size?: number;
  color?: string;
  seamColor?: string;
  rotation?: `${number}deg`;
};

export function CoffeeBean({
  size = 38,
  color = cafeConfig.theme.primary,
  seamColor = '#D6B99E',
  rotation = '0deg',
}: CoffeeBeanProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.bean,
        {
          width: size * 0.68,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ rotate: rotation }],
        },
      ]}>
      <View
        style={[
          styles.seam,
          {
            height: size * 0.72,
            backgroundColor: seamColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bean: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58,38,29,0.12)',
    shadowColor: cafeConfig.theme.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 3,
  },
  seam: {
    width: 2,
    borderRadius: 2,
    opacity: 0.88,
    transform: [{ rotate: '18deg' }],
  },
});
