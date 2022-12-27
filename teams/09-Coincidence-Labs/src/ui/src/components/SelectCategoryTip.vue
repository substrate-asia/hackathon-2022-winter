<template>
  <div class="min-h-400px md:min-h-300px pt-50px pb-40px md:pb-20px flex flex-col flex-between">
    <button class="absolute right-20px top-20px"
            @click="$emit('close')">
      <i class="w-18px h-18px 2xl:w-1rem 2xl:h-1rem icon-close"></i>
    </button>
    <div class="text-20px 2xl:text-1rem c-text-black leading-32px px-50px flex-1">
      <div class="mb-40px">{{$t('curation.switchType1', {type: (selectCategoryType === 'space') ? 'Twitter Space' : 'Tweet'})}}</div>
      <div>{{$t('curation.switchType2')}}</div>
    </div>
    <div class="flex flex-col gap-20px sm:flex-row md:mx-50px">
      <button class="w-full h-40px 2xl:h-2rem rounded-full px-1.5rem gradient-btn font-bold text-15px"
              @click="$emit('close')">
        {{$t('common.cancel')}}
      </button>
      <button class="w-full h-40px 2xl:h-2rem rounded-full px-1.5rem bg-colorD6 text-white font-bold text-15px"
              @click="$emit('confirmChangeCategory')">
        {{$t('common.confirm')}}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SelectCategoryTip",
  props: {
    selectCategoryType: {
      type: String,
      default:  ''
    },
  },
}
</script>

<style scoped>

</style>
