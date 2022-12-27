<template>
  <div>
    <!-- Default Layout -->
    <a-layout class="layout-default" id="layout-default" :class="layoutClass">
      <!-- Layout Header's Conditionally Fixed Wrapper -->
      <DefaultHeader />
      <!-- / Layout Header's Conditionally Fixed Wrapper -->

      <!-- Layout Content -->
      <a-layout class="pt-[64px]">
        <!-- Page Content -->
        <a-layout-content class="layout-default-content">
          <keep-alive>
            <router-view v-if="$route.meta.keepAlive" />
          </keep-alive>
          <router-view v-if="!$route.meta.keepAlive" />
        </a-layout-content>
        <!-- / Page Content -->
      </a-layout>
      <!-- / Layout Content -->
    </a-layout>
    <!-- / Dashboard Layout -->
  </div>
</template>
<script lang="ts" setup>
import DefaultHeader from "../../components/DefaultHeader/index.vue";
// import Breadcrumb from '@/components/Breadcrumb.vue'
import { RouterView, useRoute } from "vue-router";
import { computed, reactive } from "vue";
const routes = useRoute();

// const showBreadcrumbPathList = reactive(['Process', 'stage'])

const layoutClass = computed(() => {
  return routes.meta.layoutClass;
});

// const showBreadcrumb = computed(() => {
//   return showBreadcrumbPathList.includes(routes.name);
// });

</script>
<style lang="less" scoped>
.ant-layout {
  background: #f9f9f9;
}

.layout-default-content {
  width: 100%;
  // padding: 24px;
  // background-color: #ffffff;
  max-width: 1440px;
  min-width: 1080px;
  margin: 16px auto;
  border-radius: 12px;
  border: 1px solid transparent;
}
</style>
