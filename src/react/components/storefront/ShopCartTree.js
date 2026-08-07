import React, {useCallback, useMemo} from 'react'
import {TouchableOpacity, View} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import OrderProducts from '@controleonline/ui-orders/src/react/components/OrderProducts'
import {resolveCartTreeNodeActions} from '../../domain/cartTree'
import ShopQuantityControl from './ShopQuantityControl'
import {
  buildShopCartTreeStyles,
  shopCartTreeActionRowStyle,
  shopCartTreeIconActionsStyle,
  shopCartTreeIconButtonStyle,
  shopCartTreeQuantityControlStyle,
  shopCartTreeQuantityTextStyle,
  shopCartTreeQuantityWrapStyle,
} from './ShopCartTree.styles'

const productName = orderProduct =>
  orderProduct?.product?.product || orderProduct?.product?.name || 'item'

const ShopCartTree = ({
  cart,
  compact = false,
  onEdit,
  orderProducts,
  refreshCart,
  theme,
}) => {
  const styles = useMemo(
    () => buildShopCartTreeStyles({theme, compact}),
    [compact, theme],
  )

  const renderActions = useCallback(({
    card,
    entryType,
    orderProduct,
  }) => {
    if (!orderProduct) return null

    const isChild = entryType === 'group' || !!card?.parentCardKey
    const {canEdit} = resolveCartTreeNodeActions({
      isChild,
      orderProduct,
    })

    if (isChild) {
      if (!canEdit) return null

      return (
        <View style={shopCartTreeIconActionsStyle}>
          {canEdit ? (
            <TouchableOpacity
              accessibilityLabel={`Personalizar ${productName(orderProduct)}`}
              onPress={() => onEdit(orderProduct)}
              style={shopCartTreeIconButtonStyle({theme})}>
              <Icon name="tune" size={18} color={theme.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      )
    }

    return (
      <View style={shopCartTreeActionRowStyle(compact)}>
        <View style={shopCartTreeIconActionsStyle}>
          {canEdit ? (
            <TouchableOpacity
              accessibilityLabel={`Personalizar ${productName(orderProduct)}`}
              onPress={() => onEdit(orderProduct)}
              style={shopCartTreeIconButtonStyle({theme})}>
              <Icon name="tune" size={18} color={theme.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={shopCartTreeQuantityWrapStyle(compact)}>
          <ShopQuantityControl
            cart={cart}
            iconColor={theme.primary}
            orderProduct={orderProduct}
            orderProductId={orderProduct.id}
            product={orderProduct.product}
            refreshCart={refreshCart}
            style={shopCartTreeQuantityControlStyle}
            textStyle={shopCartTreeQuantityTextStyle}
          />
        </View>
      </View>
    )
  }, [cart, compact, onEdit, refreshCart, theme])

  return (
    <OrderProducts
      compact={compact}
      compactTree
      hierarchyGuideColor={theme.primary}
      hierarchySurfaceColor={theme.surface}
      order={cart}
      orderProducts={orderProducts}
      renderActions={renderActions}
      showDetails={false}
      showDescriptions
      showGroupNames
      showGroupStatusMarker={false}
      showHierarchyGuides
      showImages
      showPricing
      showQueuePresentation={false}
      showRootQuantityPrefix
      showRootStatusMarker={false}
      showUnitQuantity
      styles={styles}
    />
  )
}

export default ShopCartTree
