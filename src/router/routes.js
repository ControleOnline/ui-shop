
export const routes = [
    {
        path: '/shop/',
        name: 'ShopIndex',
        component: () =>  import ('@controleonline/ui-layout/src/layouts/ShopLayout.vue'),
        children: [
            {
              name: 'ShopDefoult',
              path: '/shop/',
              component: () =>  import ('../pages/Categories.vue')
            },
            {
              name: 'ProductDetails',
              path: 'category/:id/product/details',
              component: () =>  import ('../components/products/Details.vue')
            },
            {
              name: 'ProductsInCategory',
              path: 'category/:id',
              component: () =>  import ('../pages/Products.vue')
            },
            {
                name: 'AllProducts',
                path: 'products',
                component: () =>  import ('../pages/Products.vue')
            },
        ],
        meta: {
          requiresAuth: false,
        }
    }
];
