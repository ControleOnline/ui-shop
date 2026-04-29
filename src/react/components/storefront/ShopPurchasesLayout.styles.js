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
  gap: 18,
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: showCartAside ? 24 : 96,
});

export const purchasesSidebarSlotStyle = ({compact}) => ({
  width: compact ? 248 : 308,
});

export const purchasesMainSlotStyle = {
  flex: 1,
  minWidth: 0,
};

export const purchasesAsideSlotStyle = {
  width: 324,
};
