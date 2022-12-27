<template>
  <div class="mb-4">
    <div class="mb-2">
      name<span class="text-[#FD0505] ml-1">*</span>
    </div>
    <a-input @change="setYamlValue('name', formData.name)" v-model:value="formData.name" placeholder="请输入" allow-clear />
  </div>
  <div class="mb-4">
    <div class="mb-2">
      path<span class="text-[#FD0505] ml-1">*</span>
    </div>
    <a-textarea @change="setYamlValue('path', formData.path)" v-model:value="formData.path" placeholder="请输入" :auto-size="{ minRows: 3, maxRows: 6 }" allow-clear />
  </div>
</template>

<script setup lang="ts">
  import { toRefs,reactive } from 'vue';
  
  const props = defineProps({
    stage: String,
    index: Number,
    name: String,
    path: String,
  });
  const { stage, index, name, path } = toRefs(props);
  const emit = defineEmits(["setYamlCode"])

  const formData = reactive({
    name: '',
    path: '', 
  });
  Object.assign(formData, {name: name?.value, path: path?.value});

  const setYamlValue =async (item: string, val: string) => {
    emit("setYamlCode", true, stage?.value, index?.value, item, val);
  }
</script>