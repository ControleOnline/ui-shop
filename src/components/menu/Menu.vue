<template>
  <div class="q-pa-sm">
    <div class="q-row items-center justify-between">
      <div class="q-gutter-md row mainMenu">
        <!-- Categorias principais com hover -->
        <div
          v-for="category in mainCategories"
          :key="category.id"
          class="menu-btn"
          @mouseenter="openMenu(category.id)"
          @mouseleave="scheduleClose(category.id)"
        >
          <span
            @click="navigateToCategory(category.id)"
            class="text-no-decoration clickable"
          >
            {{ category.name }}
          </span>
          <!-- Menu com subcategorias, abrindo em hover -->
          <q-menu
            v-if="hasChildren(category)"
            :offset="[0, 8]"
            transition-show="slide-down"
            transition-hide="slide-up"
            v-model="activeMenu[category.id]"
            @mouseenter="cancelClose(category.id)"
            @mouseleave="scheduleClose(category.id)"
          >
            <q-list style="min-width: 100px">
              <q-item
                v-for="child in getChildren(category.id)"
                :key="child.id"
                clickable
                v-ripple
              >
                <q-item-section>
                  <span
                    @click="navigateToCategory(child.id)"
                    class="text-no-decoration clickable"
                  >
                    {{ child.name }}
                  </span>
                </q-item-section>
                <!-- Suporte a níveis adicionais -->
                <q-item-section v-if="hasChildren(child)" side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu
                  v-if="hasChildren(child)"
                  :offset="[8, 0]"
                  transition-show="slide-right"
                  transition-hide="slide-left"
                  @mouseenter="cancelClose(category.id)"
                  @mouseleave="scheduleClose(category.id)"
                >
                  <q-list>
                    <template
                      v-for="subchild in getChildren(child.id)"
                      :key="subchild.id"
                    >
                      <q-item clickable v-close-popup>
                        <q-item-section>
                          <span
                            @click="navigateToCategory(subchild.id)"
                            class="text-no-decoration clickable"
                          >
                            {{ subchild.name }}
                          </span>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-list>
                </q-menu>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <!-- Links adicionais mantidos -->
        <div><a href="#">Outro menu 01</a></div>
        <div><a href="#">Outro menu 02</a></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      categories: [],
      loading: false,
      activeMenu: {}, // Controla qual menu está aberto
      closeTimeouts: {}, // Armazena timeouts para fechamento
    };
  },
  created() {
    this.fetchCategories();
  },
  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
    mainCategories() {
      return this.categories.filter((cat) => !cat.parent);
    },
  },
  methods: {
    ...mapActions({
      getCategories: "categories/getItems",
    }),
    fetchCategories() {
      this.loading = true;
      this.getCategories({
        context: "products",
        company: this.defaultCompany.id,
      })
        .then((response) => {
          this.categories = response;
        })
        .catch((error) => {
          console.error("Erro ao carregar categorias:", error);
          this.$q.notify({
            type: "negative",
            message: "Erro ao carregar categorias.",
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
    hasChildren(category) {
      return this.categories.some((cat) => cat.parent?.id === category.id);
    },
    getChildren(parentId) {
      return this.categories.filter((cat) => cat.parent?.id === parentId);
    },
    openMenu(categoryId) {
      this.activeMenu[categoryId] = true;
    },
    scheduleClose(categoryId) {
      this.closeTimeouts[categoryId] = setTimeout(() => {
        this.activeMenu[categoryId] = false;
      }, 300);
    },
    cancelClose(categoryId) {
      if (this.closeTimeouts[categoryId]) {
        clearTimeout(this.closeTimeouts[categoryId]);
        delete this.closeTimeouts[categoryId];
      }
    },
    navigateToCategory(categoryId) {
      // Fecha todos os menus antes de navegar
      Object.keys(this.activeMenu).forEach((id) => {
        this.activeMenu[id] = false;
        if (this.closeTimeouts[id]) {
          clearTimeout(this.closeTimeouts[id]);
          delete this.closeTimeouts[id];
        }
      });

      // Navega para a categoria
      this.$router
        .push({
          name: "ProductsInCategory",
          params: { id: categoryId },
        })
        .then(() => {
          //location.reload();
        });
    },
  },
};
</script>

<style scoped>
.mainMenu {
  line-height: 2.5em;
  font-size: 14px;
  color: #000000;
  font-weight: 500;
}

.mainMenu a {
  color: inherit;
  text-decoration: none;
}

.text-no-decoration {
  text-decoration: none;
  color: inherit;
}

.menu-btn {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.menu-btn:hover {
  background-color: #1565c0;
}

.clickable {
  display: block;
  cursor: pointer;
}
</style>
