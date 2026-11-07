import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AltitudeBrand } from '@/components/altitude-brand';
import { cafeConfig } from '@/constants/cafe-config';
import { useTheme } from '@/hooks/use-theme';

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  symbol: string;
};

export function FeaturePlaceholder({ title, description, symbol }: FeaturePlaceholderProps) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.brand}>
          <AltitudeBrand color={theme.text} />
        </View>

        <View style={styles.featureContent}>
          <View style={styles.symbolTile}>
            <Text style={[styles.symbol, { color: theme.primary }]}>{symbol}</Text>
          </View>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>
            {cafeConfig.name.toUpperCase()} CAFÉ
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
          <View style={styles.previewBadge}>
            <Text style={styles.previewText}>DEMO PREVIEW</Text>
          </View>
          <Text style={[styles.note, { color: theme.textSecondary }]}>
            This is a demo placeholder. No account or café system is connected.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  brand: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  symbolTile: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderRadius: 18,
    backgroundColor: cafeConfig.theme.tint,
  },
  symbol: {
    fontSize: 32,
    fontWeight: '800',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  description: {
    maxWidth: 320,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
  },
  previewBadge: {
    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 5,
    backgroundColor: cafeConfig.theme.tint,
  },
  previewText: {
    color: cafeConfig.theme.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  note: {
    maxWidth: 280,
    marginTop: 18,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
  },
});
