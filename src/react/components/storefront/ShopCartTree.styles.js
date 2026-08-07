export const buildShopCartTreeStyles = ({theme, compact}) => ({
  itemRow: {
    paddingHorizontal: compact ? 8 : 10,
    paddingVertical: compact ? 6 : 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
    backgroundColor: theme.surface,
  },
  itemMainRow: {alignItems: 'center'},
  itemLead: {alignItems: 'center'},
  itemThumbWrap: {
    borderWidth: 1,
    borderColor: theme.cardBorder,
    backgroundColor: `${theme.primary}0D`,
  },
  itemThumbPlaceholder: {backgroundColor: `${theme.primary}0D`},
  itemThumbPlaceholderText: {color: theme.primary},
  itemContent: {justifyContent: 'center'},
  itemTitleRow: {alignItems: 'center'},
  text: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '800',
  },
  subText: {color: theme.muted, fontSize: 11},
  qtyText: {color: theme.text, fontWeight: '800'},
  metaWrap: {marginTop: 4},
  priceRow: {alignItems: 'center'},
  itemActions: {marginLeft: 8},
  groupWrap: {marginTop: 2},
  groupTitlePill: {
    alignSelf: 'flex-start',
    borderRadius: 7,
    backgroundColor: `${theme.primary}12`,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 3,
  },
  groupTitle: {
    color: theme.muted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  groupItem: {paddingVertical: 1},
  groupItemMainRow: {alignItems: 'center'},
  groupItemContent: {justifyContent: 'center'},
  groupItemText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '600',
  },
  groupItemMetaText: {color: theme.muted, fontSize: 11},
  groupItemPriceText: {color: theme.muted, fontSize: 12, fontWeight: '700'},
  groupItemActions: {marginLeft: 6},
  independentChildrenWrap: {
    borderLeftColor: `${theme.primary}38`,
    marginTop: 0,
    paddingTop: 0,
  },
  independentChildGroup: {marginTop: 5},
  rootFamilySeparator: {
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
  },
})

export const shopCartTreeActionRowStyle = compact => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: compact ? 4 : 6,
})

export const shopCartTreeIconActionsStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 4,
}

export const shopCartTreeIconButtonStyle = ({theme, danger = false}) => ({
  width: 34,
  height: 34,
  borderRadius: 9,
  borderWidth: 1,
  borderColor: danger ? `${theme.danger}30` : theme.cardBorder,
  backgroundColor: danger ? `${theme.danger}12` : `${theme.primary}0D`,
  alignItems: 'center',
  justifyContent: 'center',
})

export const shopCartTreeQuantityWrapStyle = compact => ({
  width: compact ? 88 : 96,
})

export const shopCartTreeQuantityControlStyle = {
  minHeight: 36,
  height: 36,
  borderRadius: 9,
  paddingHorizontal: 8,
}

export const shopCartTreeQuantityTextStyle = {
  fontSize: 15,
}
