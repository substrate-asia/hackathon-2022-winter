<template>
  <div class="pb-3rem sm:pb-0">
    <PostTip>
      <template #title>{{$t('curation.tweetToAttend')}}</template>
      <template #content>
        <div class="bg-color0E light:bg-white light:border-1 light:border-colorE3 p-1rem mt-1rem mb-2rem rounded-15px">
          <div class="flex ">
            <img class="w-24px h-24px min-w-24px md:w-2rem md:h-2rem mr-0.8rem rounded-full "
                @error="replaceEmptyImg"
                 :src="curation.profileImg" alt="">
            <div class="flex-1 flex justify-between items-center cursor-pointer">
              <a class="c-text-black text-left mr-3 text-1rem leading-1.5rem">{{curation.twitterName}}</a>
            </div>
          </div>
          <div class="mt-10px whitespace-pre-line leading-20px">
            {{curation.content}}
          </div>
        </div>
      </template>
      <template #btn>
        <div class="pt-1rem">
          <button class="text-color8B flex items-center justify-center border-1px border-color8B rounded-full h-28px 2xl:h-2.2rem text-12px 2xl:text-0.9rem px-1rem absolute bottom-1rem right-1rem">
            <img class="w-1rem h-1rem mr-0.4rem" src="~@/assets/icon-twitter.svg" alt="">
            <span class="text-color8B" @click="goTweet">{{$t('postView.goTweet')}}</span>
          </button>
        </div>
      </template>
    </PostTip>
  </div>
</template>

<script>
import PostTip from "@/views/post/PostTip";
import emptyAvatar from "@/assets/icon-default-avatar.svg";

export default {
  name: "TweetAttendTip",
  components: {PostTip},
  props: {
    curation: {
      type: Object,
      default: {}
    },
  },
  methods: {
    goTweet() {
      const url = `https://twitter.com/intent/tweet?text=%0a%20%23iweb3&url=https://twitter.com/${this.curation.twitterUsername}/status/${this.curation.tweetId}`

      window.open(url, '__blank')
    },
    replaceEmptyImg(e) {
      e.target.src = emptyAvatar;
    },
  },
}
</script>

<style scoped>

</style>
