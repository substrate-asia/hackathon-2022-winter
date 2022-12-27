<template>
  <div class="breadcrumb-list">
    <span @click="backRoute" class="path-info">
      <img src="@/assets/icons/back-arrow.svg" class="svg-img w-[24px] mr-[4px]" />
      <span class="align-middle">{{ $t("component.back") }}</span>
    </span>
    <span> | </span>
    <span class="align-middle">{{ currentName }}</span>
  </div>
</template>
<script lang='ts' setup>
import { toRefs } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  currentName: {
    type: String,
    default: '',
  },
});
const router = useRouter();
const { currentName } = toRefs(props);

const backRoute = () => {
  router.go(-1)
}
</script>
<style lang='less' scoped>
.breadcrumb-list {
  font-size: 18px;
  color: #7B7D7B;
  margin-bottom: 24px;
  background-color: #F9F9F9;

  .path-info {
    cursor: pointer;

    &:hover {
      color: #28c57c;
    }
  }
}
</style>