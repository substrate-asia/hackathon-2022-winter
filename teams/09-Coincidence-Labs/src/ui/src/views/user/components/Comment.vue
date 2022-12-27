<template>
  <div class="flex">
    <img class="w-2.2rem h-2.2rem md:w-3rem md:h-3rem md:ml-0.6rem mr-1.5rem rounded-full"
         :src="profile" alt="">
    <div class="flex-1 text-left">
      <div class="flex items-center flex-wrap">
        <span class="c-text-black text-1rem mr-1rem light:text-blueDark">{{comment.name}}</span>
        <!-- <img class="w-1.1rem h-1.1rem mx-0.5rem" src="~@/assets/icon-checked.svg" alt=""> -->
        <span class="text-color8B light:text-color7D">@{{comment.username}} · {{ parseTimestamp(comment.commentTime) }} </span>
      </div>
      <!-- <div class="text-left my-0.5rem">
        Replying to
        <a class="text-primaryColor" href="">@acsc</a>
      </div> -->
      <div class="text-14px leading-20px text-colorE3 light:text-color46 mt-1rem">{{comment.content}}</div>
      <div class="flex gap-4rem mt-15px">
        <div class="flex items-center">
          <i class="w-18px h-18px icon-msg"></i>
          <span class="ml-2px font-700 text-white light:text-color7D">{{ comment.children }}</span>
        </div>
        <div class="flex items-center">
          <i class="w-18px h-18px icon-like"></i>
          <span class="ml-2px font-700 text-white light:text-color7D">{{ comment.votes }}</span>
        </div>
        <div class="text-white flex items-center">
          <i class="w-18px h-18px icon-coin"></i>
          <span class="ml-2px font-700 text-white light:text-color7D">{{value}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPrice, parseTimestamp } from '@/utils/helper'

export default {
  name: "Comment",
  props: {
    comment: {
      type: Object,
      default: {}
    },
  },
  data() {
    return {
      like: true
    }
  },
  computed: {
    value() {
      if (!this.comment.content) return '$0'
      const value = this.parseSBD(this.comment.curatorPayoutValue)
       + this.parseSBD(this.comment.pendingPayoutValue)
      + this.parseSBD(this.comment.totalPayoutValue)
      return formatPrice(value)
    },
    profile() {
      if (!this.comment.profileImg) return null
      if (this.comment.profileImg) {
        return this.comment.profileImg.replace('normal', '200x200')
      }else {
        return 'https://profile-images.heywallet.com/' + this.comment.twitterId
      }
    }
  },
  methods: {
    parseTimestamp(time) {
      return parseTimestamp(time)
    },
    parseSBD(v) {
      return parseFloat(v.replace(' SBD', ''))
    },
  },
}
</script>

<style scoped>

</style>
