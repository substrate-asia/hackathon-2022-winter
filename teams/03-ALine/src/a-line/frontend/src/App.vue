<template>
  <div id="app">
    <a-config-provider>
      <component :is="layout">
        <router-view />
      </component>
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import { ConfigProvider } from 'ant-design-vue';

ConfigProvider.config({
  theme: {
    primaryColor: '#28c57c',
  },
});
const routes = useRoute();
const layout = computed(() => {
  return "layout-" + (routes.meta.layout || "default").toLowerCase();
});
</script>

<!-- <template>
  <RouterView />
</template> -->
