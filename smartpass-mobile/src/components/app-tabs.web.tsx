import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';

import { IconSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="home">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="budget" href="/budget" asChild>
            <TabButton icon="budget">Budget</TabButton>
          </TabTrigger>
          <TabTrigger name="menu" href="/menu" asChild>
            <TabButton icon="menu">Menu</TabButton>
          </TabTrigger>
          <TabTrigger name="rewards" href="/rewards" asChild>
            <TabButton icon="rewards">Rewards</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="profile">Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  icon,
  ref: _ref,
  ...props
}: TabTriggerSlotProps & { icon: string }) {
  const theme = useTheme();

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'background'}
        style={styles.tabButtonView}>
        <TabGlyph icon={icon} color={isFocused ? theme.primary : theme.textSecondary} />
        <ThemedText type="small" themeColor={isFocused ? 'primary' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const theme = useTheme();

  return (
    <View {...props} style={[styles.tabListContainer, { borderTopColor: theme.border }]}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

function TabGlyph({ icon, color }: { icon: string; color: string }) {
  if (icon === 'budget') {
    return (
      <View accessibilityElementsHidden style={[styles.chartIcon, { borderColor: color }]}>
        <View style={[styles.chartBar, styles.chartBarShort, { backgroundColor: color }]} />
        <View style={[styles.chartBar, styles.chartBarMedium, { backgroundColor: color }]} />
        <View style={[styles.chartBar, styles.chartBarTall, { backgroundColor: color }]} />
      </View>
    );
  }

  if (icon === 'menu') {
    return (
      <View accessibilityElementsHidden style={styles.menuIcon}>
        <View style={[styles.menuLine, { backgroundColor: color }]} />
        <View style={[styles.menuLine, styles.menuLineShort, { backgroundColor: color }]} />
        <View style={[styles.menuLine, { backgroundColor: color }]} />
      </View>
    );
  }

  if (icon === 'profile') {
    return (
      <View accessibilityElementsHidden style={styles.profileIcon}>
        <View style={[styles.profileHead, { backgroundColor: color }]} />
        <View style={[styles.profileShoulders, { borderColor: color }]} />
      </View>
    );
  }

  if (icon === 'rewards') {
    return (
      <View accessibilityElementsHidden style={[styles.rewardIcon, { borderColor: color }]}>
        <View style={[styles.rewardCup, { borderColor: color }]} />
        <View style={[styles.rewardStem, { backgroundColor: color }]} />
        <View style={[styles.rewardBase, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <ThemedText
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.tabIcon, { color }]}>
      {icon === 'home' ? '⌂' : '☆'}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8DED2',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 560,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    minWidth: 52,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.medium,
  },
  tabIcon: {
    height: 23,
    marginBottom: 3,
    fontSize: IconSize.large,
    lineHeight: 23,
    textAlign: 'center',
  },
  chartIcon: {
    width: 18,
    height: 17,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    marginTop: 3,
    marginBottom: 6,
    borderBottomWidth: 1.5,
  },
  chartBar: {
    width: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  chartBarShort: {
    height: 6,
  },
  chartBarMedium: {
    height: 10,
  },
  chartBarTall: {
    height: 14,
  },
  menuIcon: {
    width: 18,
    height: 17,
    justifyContent: 'center',
    gap: 3,
    marginTop: 3,
    marginBottom: 6,
  },
  menuLine: {
    width: 17,
    height: 1.5,
    borderRadius: 1,
  },
  menuLineShort: {
    width: 12,
  },
  profileIcon: {
    width: 18,
    height: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: 1,
    marginBottom: 5,
  },
  profileHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  profileShoulders: {
    width: 14,
    height: 7,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  rewardIcon: {
    width: 20,
    height: IconSize.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  rewardCup: {
    width: 13,
    height: 9,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  rewardStem: {
    width: 1.5,
    height: 3,
  },
  rewardBase: {
    width: 9,
    height: 1.5,
    borderRadius: 1,
  },
});
