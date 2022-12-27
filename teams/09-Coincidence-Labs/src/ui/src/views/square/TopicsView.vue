<template>
  <div class="">
    <div class="md:border-b-1 border-dividerColor mb-1rem">
      <div class="relative container mx-auto max-w-50rem md:px-1rem px-15px flex items-center md:justify-start justify-center h-2.8rem">
        <!--          <img class="absolute left-1rem top-1/2 transform -translate-y-1/2 rotate-180 md:w-2.5rem w-2rem cursor-pointer"-->
        <!--               @click="$router.back()"-->
        <!--               src="~@/assets/icon-forward-circle.svg" alt="">-->
        <div class="c-text-black text-1.5rem md:text-1rem mx-1.9rem light:text-blueDark">{{$t('topicsView.title')}}</div>
      </div>
    </div>
    <div class="container mx-auto sm:max-w-600px lg:max-w-35rem px-1rem pb-2rem">
      <div class="bg-blockBg light:bg-white rounded-1rem mt-2rem px-12px pt-1rem pb-3rem">
        <div v-for="(v,k,i) in tagsAggregation" :key="i" @click="choseIndex(i)"
             class="border-b-1 border-dividerColor py-1rem px-1.5rem cursor-pointer">
          <div class="flex justify-between items-center">
            <div class="text-18px md:text-1rem md:leading-1.5rem font-700 text-left light:text-blueDark">
              <span class="">#</span>
              <span class="">{{k}}</span>
            </div>
            <span class="gradient-text gradient-text-right3-deg text-18px md:text-1.2rem c-text-black">{{v}}</span>
          </div>
          <div class="flex justify-between items-center mt-0.2rem">
            <div class="flex items-center text-1rem leading-1.4rem text-left">
<!--              <img class="w-1.2rem mr-0.5rem" src="~@/assets/icon-coin-primary.svg" alt="">-->
<!--              <span class="">$1,288.66</span>-->
            </div>
            <span class="gradient-text gradient-text-right3-deg text-15px md:text-0.8rem">{{$t('topicsView.post')}}</span>
          </div>
<!--          <div class="text-left text-14px leading-24px text-color8B">-->
<!--            Utopianism, some argue, is essential for the improvement of the human condition.-->
<!--          </div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: "TopicsView",
  computed: {
    ...mapState('postsModule', ['tagsAggregation'])
  },
  methods: {
    choseIndex(i) {
      this.$store.commit('postsModule/saveCurrentTagIndex', i)
      this.$router.go(-1)
    }
  },
}
</script>

<style scoped>

</style>
