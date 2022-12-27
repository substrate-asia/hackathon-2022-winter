<template>
  <div class="h-min bg-blockBg light:bg-white dark:text-black
              border-1 border-color8B/30 light:border-black rounded-15px text-left mt-1rem overflow-hidden">
    <div class="w-full">
      <div class="flex-1 px-20px py-8px min-h-54px flex justify-between items-center">
        <div class="flex items-center">
          <i class="w-20px h-20px icon-popups"></i>
          <div class="text-white c-text-black light:text-black text-16px leading-24px ml-20px
                    whitespace-nowrap flex justify-between items-center">
            Pop-Ups
          </div>
        </div>
        <button v-if="showCreate"
                class="flex items-center whitespace-nowrap bg-color62 rounded-6px min-h-26px px-14px"
                @click.stop="create">
          <span class="text-white">Add</span>
          <img class="w-12px ml-5px" src="~@/assets/icon-add-white.svg" alt="">
        </button>
      </div>
    </div>
    <div class="collapse-box px-14px"
         :class="[popUpsCollapse?'show':'', showingPopup.length>2 && !popUpsCollapse?'hide':'']">
      <div class="h-54px xl:h-2.7rem my-8px rounded-8px overflow-hidden
                  flex flex-col justify-between cursor-pointer px-12px py-4px"
           :class="isEnded(popup)?'bg-color62/30 light:bg-colorF2':'bg-color62/80 light:bg-colorEA'"
            @click="join(popup)"
           v-for="popup of showingPopup" :key="popup.tweetId">
        <div class="flex items-center">
          <div class="flex flex-1 items-center truncate cursor-pointer">
            <div v-if="!isEnded(popup)"
                 class="light:text-black rounded-full h-18px xl:h-1rem bg-black light:bg-white whitespace-nowrap
                        px-4px flex justify-center items-center relative">
              <van-count-down class="text-white light:text-black"
                              :time="popTime(popup)" format="mm:ss" />
              <img v-if="isJoin(popup)"
                   class="w-10px h-10px absolute -right-5px bottom-0"
                   src="~@/assets/icon-selected-primary.svg" alt="">
            </div>
            <div v-else
                 class="text-white rounded-full h-18px bg-black light:bg-colorD8 whitespace-nowrap
                        px-4px flex justify-center items-center relative">
              {{ $t('popup.ended') }}
              <img v-if="isJoin(popup)"
                   class="w-10px h-10px absolute -right-5px bottom-0"
                   src="~@/assets/icon-selected-primary.svg" alt="">
            </div>
          </div>
          <div class="flex-1 flex items-center justify-end">
            <ChainTokenIcon height="18px" width="18px" :chain-name="popup.chainId.toString()"
                            class="bg-white min-w-60px"
                            :token="{address: popup.token, symbol: popup.symbol}">
              <template #amount>
                <span class="px-8px h-18px whitespace-nowrap
                             flex items-center text-12px 2xl:text-0.8rem ">
                  {{(isEnded(popup) && isJoin(popup)) ? formatAmount(popup.myReward?.toString() / (10 ** popup.decimals)) + '/' + formatAmount(popup.bonus.toString() / (10 ** popup.decimals)) : formatAmount(popup.bonus.toString() / (10 ** popup.decimals))}} {{popup.symbol}}
                </span>
              </template>
            </ChainTokenIcon>
          </div>
        </div>
        <div class="w-full flex items-center justify-between">
          <div class="flex-1 whitespace-nowrap truncate leading-18px text-white light:text-black text-12px">
            {{popup.content}}
          </div>
          <button v-if="!isEnded(popup) && !isJoin(popup)"
                  class="text-white h-18px 2xl:h-1rem px-5px rounded-full ml-20px bg-black min-w-60px">
            {{$t('curation.join')}}
          </button>
          <button v-if="(isEnded(popup) && popup.totalAcount > 0)"
                  class="text-white h-18px 2xl:h-1rem px-5px rounded-full ml-20px bg-black min-w-60px"
                  @click="selectedPopup=popup;modalVisible = true">
            {{popup.totalAcount}} >>
          </button>
        </div>
      </div>
    </div>
    <button v-show="showingPopup.length > 2" class="w-full h-24px" @click="popUpsCollapse=!popUpsCollapse">
      <i class="w-14px h-14px mx-auto icon-collapse" :class="popUpsCollapse?'transform rotate-180':''"></i>
    </button>
    <van-popup class="md:w-600px bg-black light:bg-transparent rounded-t-12px"
               v-model:show="modalVisible"
               :position="position">
      <transition name="el-zoom-in-bottom">
        <div v-if="modalVisible"
             class="dark:bg-glass light:bg-white rounded-t-12px">
          <PopUpsParticipants :pop-up="selectedPopup"  @close="modalVisible=false"></PopUpsParticipants>
        </div>
      </transition>
    </van-popup>
  </div>

</template>

<script>
import ChainTokenIcon from "@/components/ChainTokenIcon";
import { mapGetters } from 'vuex'
import { formatAmount } from "@/utils/helper";
import PopUpsParticipants from "@/components/PopUpsParticipants";

export default {
  name: "PopUpsCard",
  components: {ChainTokenIcon, PopUpsParticipants},
  props: {
    space: {
      type: Object,
      default: {}
    },
    popups: {
      type: Array,
      default: []
    },
    showCreate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectedPopup: {},
      position: document.body.clientWidth < 768?'bottom':'center',
      popUpsCollapse: false,
      timeUpdateInterval: null,
      modalVisible: false
    }
  },
  computed: {
    ...mapGetters(['getAccountInfo']),
    ...mapGetters('curation', ['detailCuration']),
    showingPopup() {
      if (!this.popups || this.popups.length === 0) return [];
      this.popups.forEach(p => ({
        ...p,
        showingState: this.popTime(p)
      }))
      let ongoing = this.popups.filter(p => p.status === 0);
      let over = this.popups.filter(p => p.status > 0);
      const hostIds = this.space.host_ids ? JSON.parse(this.space.host_ids) : []
      const speakers = this.space.speakder_ids ? JSON.parse(this.space.speakder_ids) : []
      const h = ongoing.filter(o => hostIds.find(h => h === o.twitterId)).reverse()
      const s = ongoing.filter(o => speakers.find(s => s === o.twitterId)).reverse()
      const o = ongoing.filter(o => !hostIds.find(h => h === o.twitterId) && !speakers.find(s => s === o.twitterId)).reverse()
      return h.concat(s).concat(o).concat(over)
    }
  },
  methods: {
    formatAmount,
    create() {
      if (!this.getAccountInfo || !this.getAccountInfo.twitterId) {
          this.$store.commit('saveShowLogin', true);
          return;
      }
      this.$emit('createPopUpVisible')
    },
    prefixInteger(num, length) {
      var i = (num + "").length;
      while(i++ < length) num = "0" + num;
      return num;
    },
    isEnded(popup) {
      return popup.status > 0
    },
    isJoin(popup) {
      return !!popup.retweetId
    },
    popTime(popup) {
      const now = new Date().getTime()
      const endTime = new Date(popup.endTime).getTime()
      if(endTime < now) popup.status=1
      return endTime - now
    },
    join(popup) {
      if (this.isEnded(popup) || this.isJoin(popup) || !popup.tweetId) {

      }else {
        window.open(`https://twitter.com/intent/tweet?in_reply_to=${popup.tweetId}&text=%0a%23iweb3%20%23popup`)
      }
    },
    isNumeric (val) {
      return val !== null && val !== '' && !isNaN(val)
    }
  }
}
</script>

<style scoped lang="scss">
.pop-up-bg {
  background-image: linear-gradient(93.53deg, rgba(255, 168, 0, 0.22) 2.33%, rgba(255, 227, 182, 0) 91.45%);
  background-size: 70% 100%;
  background-repeat: no-repeat;
}
.title-bg {
  background: linear-gradient(93.53deg, rgba(255, 168, 0, 0.22) 2.33%, rgba(255, 227, 182, 0) 91.45%);
}
.collapse-box {
  overflow: hidden;
  transition: max-height ease 0.2s;
  &.show {
    max-height: 1500px;
    transition: max-height ease-in-out 0.5s;
  }
  &.hide {
    max-height: 130px;
    min-height: 130px;
  }
}
</style>
