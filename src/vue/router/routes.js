export const routes = [
  {
    path: "/shop",
    component: () =>
      import("@controleonline/ui-layout/src/layouts/ShopLayout.vue"),
    children: [
      {
        name: "ShopSearch",
        path: "q=:q",
        meta: { isPublic: true },
        component: () => import("../pages/Search.vue"),
      },
      {
        name: "ShopDefault",
        path: "",
        meta: { isPublic: true },
        component: () => import("../pages/Home.vue"),
      },
      {
        name: "ShopCategories",
        path: "categories",
        meta: { isPublic: true },
        component: () => import("../pages/Categories.vue"),
      },

      {
        name: "ProductsInCategory",
        path: "category/:id",
        meta: { isPublic: true },
        component: () => import("../pages/Category.vue"),
      },
      {
        name: "AllProducts",
        path: "products",
        meta: { isPublic: true },
        component: () => import("../pages/Category.vue"),
      },
    ],
  },

  {
    path: "/product",
    component: () =>
      import("@controleonline/ui-layout/src/layouts/MainLayout.vue"),
    children: [
      {
        name: "ShopProductDetails",
        path: ":id/details",
        meta: { isPublic: true },
        component: () => import("../pages/Product.vue"),
      },
    ],
  },

  {
    path: "/cart",
    component: () =>
      import("@controleonline/ui-layout/src/layouts/MainLayout.vue"),
    children: [
      {
        name: "ShopCart",
        path: "",
        component: () => import("../pages/Cart"),
      },
    ],
  },
];
