<template>
  <div class="text-left px-1.25rem pb-1.5rem min-h-28rem">
    <div class="text-1.2rem c-text-black mb-1rem text-center">
      Create a Pop-up reply action
    </div>
    <div class="mb-2rem">Currently only support replying on tweets actions</div>
    <div class="flex justify-between items-center mt-2rem">
      <span class="c-text-black">Quick Tweet</span>
    </div>
    <div class="w-full border-1 bg-black/40 border-1 border-color8B/30
                  light:bg-colorF2 light:border-colorE3 hover:border-primaryColor
                  rounded-12px min-h-40px 2xl:min-h-2rem">
        <textarea class="bg-transparent h-full w-full px-0.5rem"
                  v-model="popUpData.content"
                  rows="4" placeholder="Type the contents"></textarea>
    </div>
    <div class="flex justify-between items-center mt-2rem">
      <span class="c-text-black">Duration</span>
    </div>
    <div class="w-full border-1 bg-black/40 border-1 border-color8B/30
                  flex items-center justify-between
                  light:bg-colorF2 light:border-colorE3 hover:border-primaryColor
                  rounded-12px h-40px 2xl:h-2rem">
      <el-select v-model="popUpData.duration" class="w-full" size="large">
        <el-option
            v-for="item in durationOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </div>
    <div class="text-center mt-2rem">
      <button class="gradient-btn h-3.6rem w-1/3 rounded-full">Send</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "CreatePopUpModal",
  data() {
    return {
      stepType: 'createContent',
      durationOptions: [
        {label: '1 min', value: 1},
        {label: '10 min', value: 10},
        {label: '30 min', value: 30},
        {label: '60 min', value: 60},
      ],
      popUpData: {
        content: '',
        duration: 1
      }
    }
  }
}
</script>

<style scoped>

</style>
