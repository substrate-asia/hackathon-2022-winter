<template>
  <div class="pt-2rem pb-3rem sm:pt-1rem sm:pb-1rem">
    <slot name="title">
      <div class="text-left font-600 text-15px 2xl:text-0.75rem mb-6px">{{$t('curation.startCuration')}}</div>
    </slot>
    <div class="bg-black/40 light:bg-colorF1 light:border-1 light:border-colorE3 rounded-1rem min-h-10rem p-1rem relative">
      <div class="text-left break-all text-14px leading-22px 2xl:text-0.8rem 2xl:leading-1.2rem">
        <span class="text-text8F whitespace-pre-line" v-html="formatEmojiText(curationContent + ' #iweb3\n')"></span>
        <span class="text-primaryColor whitespace-pre-line">
              {{ $t('curation.moreDetail') + ' => ' + CURATION_SHORT_URL + curationId}}
            </span>
      </div>
    </div>
    <!-- <div class="italic text-12px text-left mt-6px leading-15px">
      tips: Twitter content must include the #iweb3 hashtag and the curation short URL.
    </div> -->
    <div class="mt-1.5rem">
      <button class="flex items-center justify-center rounded-full gradient-btn mr-0 ml-auto w-full
                  text-12px 2xl:text-0.9rem h-44px 2xl:h-2.2rem px-1rem"
              @click="$emit('onPost')">
        <img class="w-1rem h-1rem mr-0.4rem"
             src="~@/assets/icon-twitter-white.svg" alt=""/>
        <span class="text-text8F">{{$t('postView.goTweet')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import {formatEmojiText} from "@/utils/tool";
import { CURATION_SHORT_URL } from '@/config'
export default {
  name: "TweetAndStartCuration",
  props: {
    curationContent: {
      type: String,
      default: ''
    },
    curationId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      CURATION_SHORT_URL: CURATION_SHORT_URL
    }
  },
  methods: {
    formatEmojiText,
  }
}
</script>

<style scoped>

</style>
