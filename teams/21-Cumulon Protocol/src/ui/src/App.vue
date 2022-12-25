<template>
  <a-config-provider :locale="enUS">
    <router-view />
  </a-config-provider>
</template>
<script>
import enUS from "@arco-design/web-vue/es/locale/lang/en-us";
export default {
  data() {
    return {
      enUS,
    };
  },
};
</script>
<style lang="less">
</style>
