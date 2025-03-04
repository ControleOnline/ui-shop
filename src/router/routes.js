export const routes = [
  {
    path: "/shop",

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
        path: "",
        component: () => import("../pages/Home.vue"),
      },
      {
        name: "ShopCategories",
        path: "categories",
        component: () => import("../pages/Categories.vue"),
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

  {
    path: "/product",
    component: () =>
      import("@controleonline/ui-layout/src/layouts/MainLayout.vue"),
    children: [
      {
        name: "ShopProductDetails",
        path: ":id/details",
        component: () => import("../pages/Product.vue"),
      },
    ],
  },
];
