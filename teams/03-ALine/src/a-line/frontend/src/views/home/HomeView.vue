<template>
  <span class="text-blue-700">1111</span>
  <button @click="changeLang">中/En</button>
  <hr />
  <span class="text-6xl">{{ $t("home.test") }}</span>
  <hr />
  <a-button type="dashed" size="small"> ant </a-button>
  <div class="test-less">
    <span>11111</span>
    <span class="less-child">222222</span>
  </div>
</template>

<script setup lang="ts">
const changeLang = () => {
  const language = window.localStorage.getItem("language");

  if (language == undefined || language == "zh") {
    window.localStorage.setItem("language", "en");
    location.reload();
  } else {
    window.localStorage.setItem("language", "zh");
    location.reload();
  }
};
</script>

<style lang="less" scoped>
@baseColoe: orange;

.test-less {
  background: red;

  .less-child {
    background: @baseColoe;
  }
}
</style>
