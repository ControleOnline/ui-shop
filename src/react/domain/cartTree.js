import {
  canReopenOrderProductCustomization,
} from '@controleonline/ui-orders/src/react/components/OrderProducts.utils'

export const normalizeCartTreeId = value =>
  String(value?.id || value?.['@id'] || value || '').replace(/\D/g, '')

export const isCartTreeRoot = orderProduct =>
  !normalizeCartTreeId(
    orderProduct?.orderProduct || orderProduct?.order_product,
  ) &&
  !normalizeCartTreeId(orderProduct?.parentProduct) &&
  !orderProduct?.productGroup

export const getCartTreeRoots = orderProducts =>
  (Array.isArray(orderProducts) ? orderProducts : []).filter(isCartTreeRoot)

export const resolveCartTreeNodeActions = ({isChild, orderProduct}) => ({
  canEdit: canReopenOrderProductCustomization(orderProduct),
  canRemove: !isChild,
})
