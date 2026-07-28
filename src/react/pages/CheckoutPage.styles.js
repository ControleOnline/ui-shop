import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  methodChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  methodCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  methodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  methodCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  methodCardMeta: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },
  methodCardHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  modalItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  modalItemActive: {
    borderWidth: 1.5,
  },
  modalChoicesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalChoice: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  modalChoiceActive: {
    borderWidth: 1.5,
    backgroundColor: '#EFF6FF',
  },
  modalItemTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalItemMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  modalInput: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalCloseButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '800',
  },
  confirmButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skeletonStack: {
    marginTop: 10,
    gap: 10,
  },
  formGrid: {
    marginTop: 10,
    gap: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formRowAction: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  formInput: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryButton: {
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  quoteCard: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  quoteTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  quoteMeta: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default styles;

export const inlineStyle_326_14 = {
  flex: 1,
};

export const inlineStyle_328_12 = {
  flex: 1,
};

export const inlineStyle_331_14 = (
  {
    theme: theme,
  },
) => ({
  borderRadius: 16,
  borderWidth: 1,
  borderColor: `${theme.primary}30`,
  backgroundColor: `${theme.primary}10`,
  padding: 14,
});

export const inlineStyle_339_16 = (
  {
    theme: theme,
  },
) => ({
  color: theme.primary,
  fontSize: 12,
  fontWeight: '800',
});

export const inlineStyle_343_16 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 4,
  color: theme.text,
  fontSize: 22,
  fontWeight: '800',
});

export const inlineStyle_351_20 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 6,
  color: theme.muted,
  fontSize: 13,
});

export const inlineStyle_355_16 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 6,
  color: theme.primary,
  fontSize: 28,
  fontWeight: '900',
});

export const inlineStyle_366_14 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 12,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  padding: 14,
});

export const inlineStyle_375_16 = (
  {
    theme: theme,
  },
) => ({
  color: theme.text,
  fontSize: 16,
  fontWeight: '800',
});

export const inlineStyle_380_22 = {
  paddingVertical: 18,
  alignItems: 'center',
};

export const inlineStyle_385_18 = {
  marginTop: 10,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
};

export const inlineStyle_410_26 = (
  {
    theme: theme,
  },
) => ({
  color: theme.text,
  fontSize: 12,
  fontWeight: '700',
});

export const inlineStyle_422_22 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 10,
  color: theme.muted,
});

export const inlineStyle_429_14 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 12,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  padding: 14,
});

export const inlineStyle_438_16 = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 10,
};

export const inlineStyle_445_18 = (
  {
    theme: theme,
  },
) => ({
  color: theme.text,
  fontSize: 16,
  fontWeight: '800',
});

export const inlineStyle_450_24 = (
  {
    theme: theme,
  },
) => ({
  color: theme.primary,
  fontWeight: '800',
});

export const inlineStyle_457_22 = (
  {
    theme: theme,
  },
) => ({
  color: theme.muted,
});

export const inlineStyle_468_22 = (
  {
    isSelected: isSelected,
    theme: theme,
  },
) => ({
  borderRadius: 14,
  borderWidth: 1,
  borderColor: isSelected ? theme.primary : theme.cardBorder,
  backgroundColor: isSelected ? `${theme.primary}12` : '#fff',
  padding: 12,
  marginTop: 8,
});

export const inlineStyle_480_28 = (
  {
    theme: theme,
  },
) => ({
  color: theme.text,
  fontWeight: '800',
});

export const inlineStyle_484_24 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 2,
  color: theme.text,
  fontSize: 15,
});

export const inlineStyle_489_24 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 2,
  color: theme.muted,
  fontSize: 12,
});

export const inlineStyle_504_16 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 12,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  padding: 14,
});

export const inlineStyle_513_18 = (
  {
    theme: theme,
  },
) => ({
  color: theme.text,
  fontSize: 16,
  fontWeight: '800',
});

export const inlineStyle_522_20 = {
  width: '100%',
  height: 260,
  marginTop: 10,
};

export const inlineStyle_526_18 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 10,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: '#fff',
  padding: 10,
});

export const inlineStyle_534_24 = (
  {
    theme: theme,
  },
) => ({
  color: theme.text,
  fontSize: 12,
});

export const inlineStyle_540_18 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 10,
  minHeight: 40,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  alignItems: 'center',
  justifyContent: 'center',
});

export const inlineStyle_549_24 = (
  {
    theme: theme,
  },
) => ({
  color: theme.text,
  fontWeight: '700',
});

export const inlineStyle_558_16 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 12,
  borderRadius: 12,
  backgroundColor: `${theme.danger}15`,
  padding: 10,
});

export const inlineStyle_564_22 = (
  {
    theme: theme,
  },
) => ({
  color: theme.danger,
  fontWeight: '700',
});

export const inlineStyle_572_16 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 10,
  borderRadius: 12,
  backgroundColor: `${theme.success}18`,
  padding: 10,
});

export const inlineStyle_578_22 = (
  {
    theme: theme,
  },
) => ({
  color: theme.success,
  fontWeight: '700',
});

export const inlineStyle_586_12 = (
  {
    theme: theme,
  },
) => ({
  position: 'absolute',
  left: 12,
  right: 12,
  bottom: 12,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  padding: 10,
  flexDirection: 'row',
  gap: 10,
});

export const inlineStyle_602_14 = (
  {
    isLoading: isLoading,
    isProcessing: isProcessing,
    theme: theme,
  },
) => ({
  flex: 1,
  minHeight: 46,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: theme.success,
  alignItems: 'center',
  justifyContent: 'center',
  opacity: isLoading || isProcessing ? 0.6 : 1,
});

export const inlineStyle_612_20 = (
  {
    theme: theme,
  },
) => ({
  color: theme.success,
  fontWeight: '800',
});

export const inlineStyle_620_14 = (
  {
    isLoading: isLoading,
    isProcessing: isProcessing,
    theme: theme,
  },
) => ({
  flex: 1,
  minHeight: 46,
  borderRadius: 12,
  backgroundColor: theme.primary,
  alignItems: 'center',
  justifyContent: 'center',
  opacity: isLoading || isProcessing ? 0.6 : 1,
});

export const inlineStyle_632_22 = {
  color: '#fff',
  fontWeight: '800',
};

export const inlineStyle_371_12 = {
  padding: 14,
  paddingBottom: 120,
};
