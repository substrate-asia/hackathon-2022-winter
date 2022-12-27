<template>
  <div class="relative pt-1rem">
    <div class="flex items-center justify-between px-15px">
      <div class="flex items-center" @click.stop>
        <img v-if="profileImg" @click.stop="gotoUserPage()"
             class="w-30px h-30px xl:w-1.5rem xl:h-1.5rem rounded-full mr-10px cursor-pointer"
             @error="replaceEmptyImg"
             :src="profileImg" alt="">
        <img class="w-2.6rem h-2.6rem md:w-3.6rem md:h-3.6rem mr-15px md:mr-1rem
                    min-w-40px min-h-40px rounded-full cursor-pointer"
             src="@/assets/icon-default-avatar.svg" v-else alt="">
        <div class="flex-1 flex justify-between items-center">
          <div class="flex items-center">
            <div class="flex flex-col justify-between items-start cursor-pointer" @click.stop="gotoUserPage()">
              <a class="c-text-black text-left mr-3 text-1rem leading-1.5rem">{{curation.creatorTwitterUsername}}</a>
            </div>
            <ContentTags :is-quote="isQuote" :is-reply="isReply" :content-type="contentType"/>
            <!-- <slot name="status"></slot> -->
          </div>
        </div>
      </div>
      <ChainTokenIcon class="bg-primaryColor/20"
                      height="20px" width="20px"
                      :chain-name="curation.chainId.toString()"
                      :token="{address: curation?.token, symbol: curation?.tokenSymbol}">
        <template #amount>
            <span class="px-8px h-20px whitespace-nowrap
                         flex items-center text-12px 2xl:text-0.8rem font-bold text-color62">
              {{curation.amount.toString() / (10 ** curation.decimals)}} {{curation.tokenSymbol}}
            </span>
        </template>
      </ChainTokenIcon>
    </div>
    <div class="text-left mt-20px pb-8px px-15px text-12px xl:text-0.75rem">
      <div class="c-text-black">{{$t('curation.desc')}}</div>
      <div class="text-color7D mt-8px leading-24px xl:leading-1.4rem whitespace-pre-line desc-content">{{curation?.description}}</div>
      <div class="w-full h-1px bg-color8B/30 light:bg-colorF2 my-8px"></div>
      <div v-if="curation?.endtime < (new Date().getTime() / 1000)"
           class="flex justify-between items-center c-text-black">
        <span class="">{{$t('curation.endedAt')}}</span>
        <button class="xl:1.3rem text-colorCE light:text-redColor rounded-5px">
          {{parseTimestampToUppercase(curation.endtime)}}
        </button>
      </div>
      <!-- ongoing -->
      <div v-else class="flex justify-between items-center c-text-black">
        <span class="">{{$t('curation.expire')}}</span>
        <button class="xl:1.3rem text-color62 rounded-5px">
          <van-count-down v-if="curation && curation.endtime" class="text-color7D"
                          :time="countdown(curation.endtime)">
            <template #default="timeData">
              <span v-if="timeData.days>0">
                {{ timeData.days }} <span class="text-color62">DAY</span>
                {{ timeData.hours }} <span class="text-color62">HOURS</span>
                {{ timeData.minutes }} <span class="text-color62">MIN</span>
              </span>
              <span v-else-if="timeData.hours>0">
                {{ timeData.hours }} <span class="text-color62">HOURS</span>
                {{ timeData.minutes }} <span class="text-color62">MIN</span>
                {{ timeData.seconds }} <span class="text-color62">S</span>
              </span>
              <span v-else>
                {{ timeData.minutes }} <span class="text-color62">MIN</span>
                {{ timeData.seconds }} <span class="text-color62">S</span>
              </span>
            </template>
          </van-count-down>
        </button>
      </div>
    </div>
    <div class="min-h-7px cursor-pointer" @click.stop="showTweet=true" v-if="!curation.tweetId && curation.curationStatus < 1">
      <div class="bg-tag-gradient h-26px xl:h-1.3rem flex items-center justify-between text-white px-15px">
        <button class="font-600">Click to Tweet</button>
        <span>Pending...</span>
      </div>
    </div>
    <van-popup class="c-tip-drawer 2xl:w-2/5"
               teleport="body"
               v-model:show="showTweet"
               :position="position">
      <div class="modal-bg w-full md:w-560px 2xl:max-w-28rem
      max-h-80vh 2xl:max-h-28rem overflow-auto flex flex-col
      rounded-t-1.5rem md:rounded-b-1.5rem pt-1rem md:py-2rem">
        <div class="flex-1 overflow-auto px-1rem xl:px-2.5rem no-scroll-bar pt-1rem pb-2rem md:py-0">
          <TweetAndStartCuration :curation-content="curation.description"
                                 :curation-id="curation.curationId"
                                 @onPost="onPost">
            <template #title>
              <div class="c-text-black md:text-1.6rem md:leading-2rem text-1.2rem leading-1.6rem
                          text-left md:text-center w-full mb-1rem">
                {{$t('curation.startCuration')}}
              </div>
            </template>
          </TweetAndStartCuration>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import emptyAvatar from "@/assets/icon-default-avatar.svg";
import { parseTimestamp } from '@/utils/helper'
import { mapGetters } from "vuex";
import {formatEmojiText, isNumeric} from "@/utils/tool";
import ChainTokenIcon from "@/components/ChainTokenIcon";
import ContentTags from "@/components/ContentTags";
import {parseTimestampToUppercase} from "@/utils/helper";
import TweetAndStartCuration from "@/components/TweetAndStartCuration";
import { CURATION_SHORT_URL } from '@/config'

export default {
  name: "RelatedCurationItem",
  components: {ChainTokenIcon, ContentTags, TweetAndStartCuration},
  props: {
    curation: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      position: document.body.clientWidth < 768?'bottom':'center',
      enableFold: true,
      isFold: false,
      isLiking: false,
      isFollowing: false,
      isEnd: false,
      showTweet: false
    }
  },
  computed: {
    ...mapGetters(['getAccountInfo']),
    profileImg() {
      return this.curation.creatorProfileImg.replace('normal', '200x200')
    },
    contentType() {
      return this.curation.curationType === 1 ? 'tweet' : 'space'
    },
    endtime() {
      if (this.curation.curationStatus === 0){
        return parseTimestamp(this.curation.endtime * 1000)
      }else {
        return this.$t('curation.end')
      }
    },
    title() {
      const t = this.curation.content.split('\n')[0]
      if (t.length > 30) {
        return t.slice(0, 30)
      }else {
        return t
      }
    },
    content() {
      return this.curation.content
    },
    isQuote() {
      if (!this.curation) return false;
      return this.curation.tasks & 1;
    },
    isReply() {
      if (!this.curation) return false;
      return (this.curation.tasks & 2) / 2
    },
  },
  methods: {
    formatEmojiText,
    replaceEmptyImg(e) {
      e.target.src = emptyAvatar;
    },
    gotoUserPage() {
      if (!this.getAccountInfo || this.curation.creatorTwitterUsername !== this.getAccountInfo.twitterUsername){
        this.$router.push({path : '/account-info/@' + this.curation.creatorTwitterUsername})
      }
    },
    parseTimestampToUppercase,
    countdown(time) {
      if(!time || !isNumeric(time)) return 0
      return time*1000 - new Date().getTime()
    },
    onPost() {
      // transfer text to uri
      const content = this.curation.description + ' #iweb3\n' + this.$t('curation.moreDetail') +  ' => ' + CURATION_SHORT_URL + this.curation.curationId
      // if (content.length > 280) {
      //   notify({message: this.$t('tips.textLengthOut'), duration: 5000, type: 'error'})
      //   return;
      // }

      let url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(content)
      window.open(url, '__blank')
      this.showTweet = false
    },
  },
  mounted() {
    this.enableFold = this.$refs.blogRef?.clientHeight > 200
    this.isEnd = this.curation.curationStatus > 0
  }
}
</script>

<style scoped>
.desc-content {
  word-break: break-word;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
</style>
