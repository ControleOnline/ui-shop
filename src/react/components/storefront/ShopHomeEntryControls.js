import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ShopHomeEntryControls({
  entries = [],
  activeEntryKey = '',
  showTopControl = true,
  showBottomBar = false,
  bottomOffset = 88,
  theme,
  onSelect,
}) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeEntry = useMemo(
    () =>
      entries.find(entry => entry.key === activeEntryKey) ||
      entries[0] ||
      null,
    [activeEntryKey, entries],
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [activeEntryKey]);

  if (
    !Array.isArray(entries) ||
    entries.length <= 1 ||
    !activeEntry ||
    (!showTopControl && !showBottomBar)
  ) {
    return null;
  }

  return (
    <>
      {showTopControl && (
        <View style={styles.topWrap}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setMenuOpen(current => !current)}
            style={[
              styles.trigger,
              {
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.18)',
              },
            ]}>
            <View style={styles.triggerIconWrap}>
              <Icon name={activeEntry.iconName} size={18} color="#FFFFFF" />
            </View>
            <View style={styles.triggerCopy}>
              <Text style={styles.triggerEyebrow}>Entrada atual</Text>
              <Text style={styles.triggerLabel}>{activeEntry.label}</Text>
            </View>
            <Icon
              name={menuOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {menuOpen && (
            <View
              style={[
                styles.dropdown,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.cardBorder,
                },
              ]}>
              {entries.map(entry => {
                const selected = entry.key === activeEntry.key;

                return (
                  <TouchableOpacity
                    key={entry.key}
                    activeOpacity={0.88}
                    onPress={() => {
                      setMenuOpen(false);
                      onSelect?.(entry);
                    }}
                    style={[
                      styles.dropdownItem,
                      selected && {
                        backgroundColor: '#F0FDFA',
                        borderColor: '#99F6E4',
                      },
                    ]}>
                    <Icon
                      name={selected ? 'check-circle' : entry.iconName}
                      size={20}
                      color={selected ? '#0F766E' : theme.primary}
                    />
                    <View style={styles.dropdownCopy}>
                      <Text style={[styles.dropdownLabel, {color: theme.text}]}>
                        {entry.label}
                      </Text>
                      <Text style={[styles.dropdownMeta, {color: theme.muted}]}>
                        {entry.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {showBottomBar && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.surface,
              borderColor: theme.cardBorder,
              bottom: insets.bottom + bottomOffset,
            },
          ]}>
          {entries.map(entry => {
            const selected = entry.key === activeEntry.key;

            return (
              <TouchableOpacity
                key={entry.key}
                activeOpacity={0.9}
                onPress={() => onSelect?.(entry)}
                style={[
                  styles.bottomBarItem,
                  selected && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}>
                <Icon
                  name={entry.iconName}
                  size={18}
                  color={selected ? theme.onPrimary : theme.primary}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.bottomBarText,
                    {
                      color: selected ? theme.onPrimary : theme.primary,
                    },
                  ]}>
                  {entry.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  topWrap: {
    marginTop: 12,
    paddingHorizontal: 14,
    zIndex: 20,
  },
  trigger: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  triggerCopy: {
    flex: 1,
    marginRight: 10,
  },
  triggerEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  triggerLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  dropdown: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownCopy: {
    flex: 1,
    marginLeft: 12,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 45,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },
  bottomBarItem: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E1EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  bottomBarText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
