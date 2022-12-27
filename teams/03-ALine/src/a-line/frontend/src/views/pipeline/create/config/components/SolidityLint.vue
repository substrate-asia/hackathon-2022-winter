<template>
  <div class="mb-4">
    <div class="mb-2">
      name<span class="text-[#FD0505] ml-1">*</span>
    </div>
    <a-input @change="setYamlValue('name', formData.name)" v-model:value="formData.name" placeholder="请输入"
      allow-clear />
  </div>
  <div class="mb-4">
    <div class="mb-2">
      type<span class="text-[#FD0505] ml-1">*</span>
    </div>
    <a-input @change="setYamlValue('type', formData.type)" v-model:value="formData.type" placeholder="请输入"
      allow-clear />
  </div>
</template>
<script lang='ts' setup>
import { reactive, toRefs } from "vue";
const props = defineProps({
  stage: String,
  index: Number,
  name: String,
  type: String,
});

const { stage, index, name, type } = toRefs(props);
const emit = defineEmits(["setYamlCode"])
const formData = reactive({
  name: '',
  type: '',
})

Object.assign(formData, { name: name?.value, type: type?.value });

const setYamlValue = async (item: string, val: string) => {
  emit("setYamlCode", true, stage?.value, index?.value, item, val);
}
</script>
<style lang='scss' scoped>

</style>