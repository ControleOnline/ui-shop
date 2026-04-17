import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ShopFeatureState({
  theme,
  iconName = 'info',
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryText,
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.cardBorder,
        },
      ]}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
          },
        ]}>
        <Icon name={iconName} size={24} color={theme.primary} />
      </View>
      <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
      {!!description && (
        <Text style={[styles.description, {color: theme.muted}]}>
          {description}
        </Text>
      )}
      {!!secondaryText && (
        <Text style={[styles.secondaryText, {color: theme.muted}]}>
          {secondaryText}
        </Text>
      )}
      {!!primaryActionLabel && !!onPrimaryAction && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPrimaryAction}
          style={[
            styles.button,
            {
              backgroundColor: theme.primary,
            },
          ]}>
          <Text style={[styles.buttonText, {color: theme.onPrimary}]}>
            {primaryActionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 22,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  secondaryText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  button: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
