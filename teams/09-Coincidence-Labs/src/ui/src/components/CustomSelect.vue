<template>
  <el-select v-model="selectedValue"
             @change="$emit('change', selectedValue)"
             @visible-change="visibleChange"
             class="w-full h-full border-0 c-select"
             :class="show?'light:bg-colorF1':'light:bg-white'"
             popper-class="c-popper"
             size="large">
    <template #prefix>
      <slot name="prefix"><div></div></slot>
    </template>
    <slot name="options"></slot>
  </el-select>
</template>

<script>
export default {
  name: "CustomSelect",
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedValue: '',
      show: false
    }
  },
  mounted() {
    this.selectedValue = this.value
  },
  methods: {
    visibleChange(val) {
      this.show = val
    }
  }
}
</script>

<style scoped>

</style>
