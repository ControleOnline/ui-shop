<template>
  <div class="q-pa-md">
    <div class="q-row items-center justify-between">
      <div class="q-gutter-md row mainMenu">
      <q-btn color="primary" label="Basic Menu">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup>
              <q-item-section>Categorias 01</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>Categorias 02</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section>Categorias 03</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>Categorias 04</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>Categorias 05</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section>Categorias 06</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section>Precisa de ajuda?</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>


        <div><a href="#">Outro menu 01</a></div>
        <div><a href="#">Outro menu 02</a></div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.mainMenu {
  line-height: 2.5em;
  font-size: 14px;
  color:#000000;
  font-weight: 500;
}

.mainMenu a {
  color: inherit;
  text-decoration: none;
}


</style>