export const routes = [
  {
    path: "/",
    name: "ShopIndex",
    component: () =>
      import("@controleonline/ui-layout/src/layouts/ShopLayout.vue"),
    children: [
      {
        name: "ShopDefault",
        path: "home",
        component: () => import("../pages/Home.vue"),
      },
      {
        name: "ShopCategories",
        path: "categories",
        component: () => import("../pages/Categories.vue"),
      },
      {
        name: "ProductDetails",
        path: "category/:id/product/details",
        component: () => import("../pages/Product.vue"),
      },
      {
        name: "ProductsInCategory",
        path: "category/:id",
        component: () => import("../pages/Category.vue"),
      },
      {
        name: "AllProducts",
        path: "products",
        component: () => import("../pages/Category.vue"),
      },
    ],
    meta: {
      requiresAuth: false,
    },
  },
];
