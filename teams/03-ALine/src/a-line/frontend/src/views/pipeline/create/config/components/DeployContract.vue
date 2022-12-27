<template>
  <div class="mb-4">
    <div class="mb-2">
      network<span class="text-[#FD0505] ml-1">*</span>
    </div>
    <a-select ref="select" v-model:value="formData.network" style="width: 100%"
      @change="setYamlValue('network', formData.network)">
      <a-select-option value="default">default</a-select-option>
      <a-select-option value="rinkeby">rinkeby</a-select-option>
      <a-select-option value="goerli">goerli</a-select-option>
      <a-select-option value="mainnet">mainnet</a-select-option>
      <a-select-option value="moonbeam">moonbeam</a-select-option>
      <a-select-option value="moonriver">moonriver</a-select-option>
      <a-select-option value="moonbase">moonbase</a-select-option>
    </a-select>
  </div>
  <div class="mb-4">
    <div class="mb-2">
      private-key<span class="text-[#FD0505] ml-1">*</span>
    </div>
    <a-input @change="setYamlValue('private-key', formData.privateKey)" v-model:value="formData.privateKey"
      placeholder="请输入" allow-clear />
  </div>
</template>
<script lang='ts' setup>
import { reactive, toRefs } from "vue";
const props = defineProps({
  stage: String,
  index: Number,
  network: String,
  privateKey: String,
});

const { stage, index, network, privateKey } = toRefs(props);
const emit = defineEmits(["setYamlCode"])
const formData = reactive({
  network: '',
  privateKey: '',
})

Object.assign(formData, { network: network?.value, privateKey: privateKey?.value });

const setYamlValue = async (item: string, val: string) => {
  emit("setYamlCode", true, stage?.value, index?.value, item, val);
}
</script>
<style lang='less' scoped>

</style>