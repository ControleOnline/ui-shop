<template>
  <div class="q-pa-md">
    <div class="q-row items-center justify-between">
      <div class="q-gutter-md row mainMenu">
      <q-btn color="primary" label="Basic Menu">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup>
              <q-item-section>New tab</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>New incognito tab</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section>Recent tabs</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>History</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>Downloads</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section>Settings</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section>Help &amp; Feedback</q-item-section>
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