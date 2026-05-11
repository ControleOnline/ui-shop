export const purchasesLayoutRootStyle = {
  flex: 1,
  paddingBottom: 18,
};

export const purchasesTopSlotStyle = {
  zIndex: 1,
};

export const purchasesMainRowStyle = ({showSidebar, showCartAside}) => ({
  flexDirection: showSidebar || showCartAside ? 'row' : 'column',
  alignItems: 'flex-start',
  gap: 14,
  paddingHorizontal: 14,
  paddingTop: 12,
  paddingBottom: showCartAside ? 24 : 96,
});

export const purchasesSidebarSlotStyle = ({compact}) => ({
  width: compact ? 232 : 288,
});

export const purchasesMainSlotStyle = {
  flex: 1,
  minWidth: 0,
  alignSelf: 'stretch',
};

export const purchasesAsideSlotStyle = {
  width: 292,
};
