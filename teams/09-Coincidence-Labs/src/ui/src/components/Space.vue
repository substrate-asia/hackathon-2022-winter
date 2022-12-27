<template>
  <div class="p-17px 2xl:p-1rem sm:rounded-1rem flex flex-col justify-between">
    <div class="flex justify-between items-center text-14px 2xl:text-0.8rem">
      <div class="flex items-center">
        <img v-if="space.authorProfileImg || space.creatorProfileImg"
             class="w-30px h-30px xl:w-1.5rem xl:h-1.5rem rounded-full"
             :src="(space.authorProfileImg ?? space.creatorProfileImg).replace('normal', '200x200')" alt="">
        <img v-else class="w-30px h-30px xl:w-1.5rem xl:h-1.5rem rounded-full opacity-50"
             src="~@/assets/icon-default-avatar.svg" alt="">
        <div class="flex-1 flex flex-col items-start cursor-pointer" @click.stop="gotoUserPage()">
          <div class="flex items-center flex-wrap">
            <a class="c-text-black text-left mr-3 ml-3 text-16px leading-18px 2xl:text-1rem 2xl:leading-1.5rem text-white">
              @{{ space.authorUsername ?? space.creatorTwitterUsername }}</a>
          </div>
        </div>
      </div>
    </div>
    <div class="text-left c-text-black text-16px 2xl:text-1.2rem text-white">{{ space.spaceTitle }}</div>
    <button class="bg-white h-30px 2xl:1.5rem w-full rounded-full font-bold flex justify-center items-center"
      @click.stop="gotoSpace">
     <img v-if="space.spaceState === 2" class="w-10x mr-5px" src="~@/assets/icon-listen.svg" alt="">
      <span class="c-text-black text-14px 2xl:text-0.8rem text-black">{{ state }}</span>
    </button>
  </div>
</template>

<script>
import { parseSpaceStartTime } from '@/utils/helper'

export default {
  name: "Space",
  props: {
    space: {
      type: Object,
      default: {}
    },
  },
  computed: {
    state() {
      switch (this.space.spaceState) {
        case 1:
          return parseSpaceStartTime(this.space.spaceStartedAt)
        case 2:
          return this.$t('space.listening')
        case 3:
          return this.$t('space.ended')
        case 4:
          return this.$t('space.canceled')
        case 'scheduled':
          return parseSpaceStartTime(this.space.scheduledStart)
        case 'live':
          return this.$t('space.listening')
        case 'ended':
          return this.$t('space.ended')
        case 'canceled':
          return this.$t('space.canceled')
        default:
          break;
      }
    }
  },
  data() {
    return {
      stateMap: {
        1: 'Schedualed',
        2: 'Listening',
        3: 'Ended',
        4: 'Canceled'
      }
    }
  },
  methods: {
    gotoUserPage() {
    },
    gotoSpace () {
      window.open('https://twitter.com/i/spaces/' + this.space.spaceId)
    }
  },
}
</script>

<style scoped>
.space-box {
  background: linear-gradient(135.53deg, #917AFD 2.61%, #6246EA 96.58%);
}
</style>
