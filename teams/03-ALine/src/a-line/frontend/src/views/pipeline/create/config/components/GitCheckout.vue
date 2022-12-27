<template>
  <div class="mb-4">
    <div class="mb-2">
      url<span class="text-[#FD0505] ml-1">*</span>
    </div>
    <a-input @change="setYamlValue('url', formData.url)" v-model:value="formData.url" placeholder="请输入" allow-clear />
  </div>
  <div class="mb-4">
    <div class="mb-2">
      branch<span class="text-[#FD0505] ml-1">*</span>
    </div>
    <a-input @change="setYamlValue('branch', formData.branch)" v-model:value="formData.branch" placeholder="请输入" allow-clear />
  </div>
</template>

<script setup lang="ts">
  import { toRefs, reactive } from 'vue';
  
  const props = defineProps({
    stage: String,
    index: Number,
    url: String,
    branch: String,
  });
  const { stage, index, url, branch } = toRefs(props);
  const emit = defineEmits(["setYamlCode"])

  const formData = reactive({
    url: '',
    branch: '', 
  });
  Object.assign(formData, { url: url?.value, branch: branch?.value });

  const setYamlValue =async (item: string, val: string) => {
    emit("setYamlCode", true, stage?.value, index?.value, item, val);
  }
</script>