import {
  getCartTreeRoots,
  resolveCartTreeNodeActions,
} from '../../../react/domain/cartTree'

describe('cartTree', () => {
  it('keeps only transactional roots in totals and cart-wide actions', () => {
    const root = {id: 1, product: {id: 10}}
    const child = {
      id: 2,
      orderProduct: '/order_products/1',
      parentProduct: '/products/10',
      productGroup: {id: 20},
    }
    const grandchild = {
      id: 3,
      orderProduct: '/order_products/2',
      parentProduct: '/products/11',
      productGroup: {id: 21},
    }

    expect(getCartTreeRoots([root, child, grandchild])).toEqual([root])
  })

  it('keeps descendant removal inside the customization screen', () => {
    expect(resolveCartTreeNodeActions({
      isChild: true,
      orderProduct: {
        product: {type: 'product'},
        productGroup: {required: false, minimum: 0},
      },
    })).toEqual({canEdit: false, canRemove: false})

    expect(resolveCartTreeNodeActions({
      isChild: true,
      orderProduct: {
        product: {type: 'custom'},
        productGroup: {required: true, minimum: 1},
      },
    })).toEqual({canEdit: true, canRemove: false})
  })
})
