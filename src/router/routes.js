export const routes = [
  {
    path: "/",

    component: () =>
      import("@controleonline/ui-layout/src/layouts/ShopLayout.vue"),
    children: [
      {
        name: "ShopSearch",
        path: "q=:q",
        component: () => import("../pages/Search.vue"),
      },
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
        path: "product/:id/details",
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
