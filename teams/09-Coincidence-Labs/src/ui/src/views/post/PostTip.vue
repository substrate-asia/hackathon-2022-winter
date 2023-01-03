<template>
  <div>
    <div class="c-text-black md:text-1.6rem md:leading-2rem text-1.2rem leading-1.6rem md:text-center w-full">
      <slot name="title">{{$t('postView.tweetPost')}}</slot>
    </div>
    <div class="bg-black light:bg-social-token-box rounded-15px px-1rem mt-1.5rem mb-1rem overflow-hidden ">
      <div class="text-15px 2xl:text-1rem px-1rem py-0.7rem
                  border-b-1 border-color84/30 light:border-colorE0/80">
        <span class="light:text-colorE0/80">{{$t('postView.socialToken')}}</span>
      </div>
      <div class="mt-1rem md:mt-1rem mb-1rem">
        <div class="mb-1rem text-right">
          <div class="text-colorB5 light:text-colorE0/80 mb-0.5rem text-14px 2xl:text-.8rem">{{ steemBalance }} STEEM</div>
          <div class="text-white c-text-black text-1.6rem">{{ steemValue}} </div>
        </div>
        <div class="flex justify-between items-center mb-0.5rem">
          <div class="flex items-center justify-center">
            <span class="text-color8B light:text-colorE0/80 text-14px 2xl:text-0.7rem whitespace-nowrap">{{$t('postView.resourceCredits')}}</span>
            <el-tooltip popper-class="shadow-popper-tip">
              <template #content>
                <div class="max-w-14rem text-white light:text-blueDark">
                  {{$t('postView.p1')}}
                </div>
              </template>
              <button>
                <img class="w-14px 2xl:w-1.2rem ml-0.5rem" src="~@/assets/icon-warning-grey.svg" alt="">
              </button>
            </el-tooltip>
          </div>
          <span class="c-text-black text-16px 2xl:text-0.8rem text-white">{{rcPercent}}%</span>
        </div>
        <el-progress class="c-progress" :text-inside="false" :stroke-width="10"
                     :show-text="false"
                     :percentage="Number(rcPercent)" />
      </div>
    </div>
    <div class="bg-black/40 light:bg-colorF1 light:border-1 light:border-colorE3 rounded-1rem min-h-8rem p-1rem mt-0.8rem relative">
      <div class="text-left break-all 2xl:text-0.8rem text-14px">
        <slot name="content">
          <span class="text-text8F">{tweet content}</span>
          <span class="text-primaryColor light:text-color62"> #iweb3</span>
        </slot>
      </div>
      <slot name="btn">
        <button class="text-color8B flex items-center justify-center border-1px border-color8B rounded-full h-28px 2xl:h-2.2rem text-12px 2xl:text-0.9rem px-1rem absolute bottom-1rem right-1rem">
          <img class="w-1rem h-1rem mr-0.4rem" src="~@/assets/icon-twitter.svg" alt="">
          <span class="text-color8B" @click="gotoTweet">{{$t('postView.goTweet')}}</span>
        </button>
      </slot>
    </div>
    <div class="text-white light:text-color7D text-12px 2xl:text-0.8rem 2x:leading-1rem mt-0.5rem italic text-left">
      {{$t('postView.tips')}}: <br> {{$t('postView.p2')}}
    </div>
    <!--    <button v-else @click="tipDrawer=false"-->
<!--            class="w-4rem h-2.5rem absolute transform top-1rem left-1/2 -translate-x-1/2">-->
<!--      <img class="w-2rem mx-auto" src="~@/assets/icon-drawer-arrow-white.svg" alt="">-->
<!--    </button>-->
  </div>
</template>

<script>
import {mapState, mapGetters} from "vuex";
import { formatPrice } from '@/utils/helper'
import { getAccountRC } from '@/utils/steem'
import { TWITTER_POST_TAG } from '@/config'

export default {
  name: "PostTip",
  computed: {
    ...mapState(['accountInfo', 'posts', 'rcPercent', 'steemBalance', 'prices']),
    ...mapGetters(['getAccountInfo']),
    steemValue() {
      return formatPrice(this.steemBalance * this.prices['steem'])
    }
  },
  mounted () {
    getAccountRC(this.getAccountInfo.steemId).then(rc => {
      this.$store.commit('saveRcPercent', parseFloat(rc[0] / rc[1] * 100).toFixed(2))
    }).catch();
  },
  methods: {
    gotoTweet() {
      window.open(
        "https://twitter.com/intent/tweet?text=" +
          TWITTER_POST_TAG,
        "__blank"
      );
    }
  },
}
</script>

<style scoped>
.top-box {
  background: linear-gradient(99.28deg, rgba(83, 83, 83, 0.8) 0.41%, rgba(78, 72, 61, 0.8) 75.78%);
  border: 1px solid #323436;
  border-radius: 12px;
}

</style>
