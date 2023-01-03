<template>
  <div class="mb-4">
    <div class="mb-2">
      workdir<span class="text-[#FD0505] ml-1">*</span>
    </div>
    <a-input @change="setYamlValue('workdir', formData.workdir)" v-model:value="formData.workdir" placeholder="请输入"
      allow-clear />
  </div>
</template>
<script lang='ts' setup>
import { reactive, toRefs } from "vue";
const props = defineProps({
  stage: String,
  index: Number,
  workdir: String,
});

const { stage, index, workdir } = toRefs(props);
const emit = defineEmits(["setYamlCode"])
const formData = reactive({
  workdir: '',
})

Object.assign(formData, { workdir: workdir?.value });

const setYamlValue = async (item: string, val: string) => {
  emit("setYamlCode", true, stage?.value, index?.value, item, val);
}
</script>
<style lang='scss' scoped>

</style>