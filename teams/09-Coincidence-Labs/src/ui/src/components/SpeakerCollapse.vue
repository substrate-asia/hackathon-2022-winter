<template>
  <div class="px-1.25rem pt-8px text-left">
    <div class="c-text-black">Speakers</div>
    <div class="w-full h-1px bg-color8B/30 light:bg-black my-10px"></div>
    <div class="collapse-box" :class="isCollapse?'show':''">
      <div class="flex flex-wrap gap-x-4px" ref="speakerListRef">
        <div class="flex flex-col justify-center items-center py-0.5rem w-60px sm:w-80px truncate cursor-pointer">
          <div class="border-2 gradient-border gradient-border-color3 rounded-full relative mt-10px">
            <img v-if="host.profileImg"
                @click="gotoUserTwitter(host)"
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full"
                 :src="avatar(host.profileImg)" alt="">
            <img v-else
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 src="~@/assets/icon-default-avatar.svg" alt="">
            <img class="absolute -top-10px -left-8px" src="~@/assets/tag-host.svg" alt="">
          </div>
          <span class="w-full text-center truncate mt-4px">{{host.name}}</span>
        </div>
        <div class="flex flex-col justify-center items-center py-0.5rem w-60px sm:w-80px truncate cursor-pointer"
             v-for="u of coHosts" :key="'co' + u.twitterId"
             @click="gotoUserTwitter(u)">
          <div class="border-2 gradient-border gradient-border-color3 rounded-full relative mt-10px">
            <img v-if="u.profileImg"
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 :src="avatar(u.profileImg)" alt="">
            <img v-else
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 src="~@/assets/icon-default-avatar.svg" alt="">
            <img class="absolute -top-10px -left-8px" src="~@/assets/tag-co-hosts.svg" alt="">
          </div>
          <span class="w-full text-center truncate mt-4px">{{u.name}}</span>
        </div>
        <div class="flex flex-col justify-center items-center py-0.5rem w-60px sm:w-80px truncate cursor-pointer"
             v-for="u of speakers" :key="'speaker' + u.twitterId"
             @click="gotoUserTwitter(u)">
          <div class="border-2 gradient-border gradient-border-color3 rounded-full mt-10px">
            <img v-if="u.profileImg"
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 :src="avatar(u.profileImg)" alt="">
            <img v-else
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 src="~@/assets/icon-default-avatar.svg" alt="">
          </div>
          <span class="w-full text-center truncate mt-4px">{{u.name}}</span>
        </div>
      </div>
    </div>
    <button class="w-full min-h-1rem"
            :disabled="!enableCollapse"
            @click="isCollapse=!isCollapse">
      <i v-if="enableCollapse"
         class="w-14px h-14px mx-auto icon-collapse"
         :class="isCollapse?'transform rotate-180':''"></i>

    </button>
  </div>
</template>

<script>
export default {
  name: "SpeakerCollapse",
  props: {
    space: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      allUsers: [],
      host: {},
      coHosts: [],
      speakers: [],
      enableCollapse: false,
      isCollapse: false
    }
  },
  methods: {
    avatar(url) {
      return url.replace('normal', '200x200')
    },
    gotoUserTwitter(user) {
      window.open(`https://twitter.com/` + user.username)
    }
  },
  watch: {
    space(newValue, oldValue) {
      if (newValue.hosts && newValue.hosts.length > 0) {
      this.host = newValue.hosts.find(h => h.twitterId === newValue.creatorId)
      this.coHosts = newValue.hosts.filter(h => h.twitterId !== newValue.creatorId);
      this.speakers = newValue.speakers ?? [];
      this.allUsers = [this.host].concat(this.coHosts).concat(this.speakers)
    };
      if(this.$refs.speakerListRef && this.$refs.speakerListRef.clientHeight > 90) {
        this.enableCollapse = true
      }
    }
  },
  mounted () {
    if(this.$refs.speakerListRef && this.$refs.speakerListRef.clientHeight > 90) {
      this.enableCollapse = true
    }
  },
}
</script>

<style scoped lang="scss">
.collapse-box {
  max-height: 82px;
  min-height: 82px;
  overflow: hidden;
  transition: max-height ease 0.2s;
  &.show {
    max-height: 1500px;
    transition: max-height ease-in-out 0.5s;
  }
}
</style>
