<template>
  <div class="">
    <div class="relative">
      <div class="flex items-center pb-8px" @click.stop>
        <div class="flex-1 flex justify-between items-center px-15px">
          <div class="flex items-center">
            <div class="flex flex-col justify-between items-start cursor-pointer light:text-color59
                        c-text-black text-14px leading-18px 2xl:text-0.7rem 2xl:leading-0.9rem"
                 @click.stop="gotoUserPage()">
              <a class="c-text-black text-left mr-3 text-1rem leading-1.5rem">{{curation.creatorTwitterUsername}} create a curation</a>
<!--              <span class="text-orangeColor light:text-color62 text-12px xl:text-0.75rem">{{endtime}}</span>-->
            </div>
            <ContentTags :is-quote="isQuote" :is-reply="isReply" :content-type="contentType"/>
            <slot name="status"></slot>
          </div>
        </div>
      </div>
      <div class="px-15px pt-10px pb-15px bg-blockBg light:bg-white mb-20px rounded-15px shadow-card">
        <div v-if="contentType==='tweet'">
          <Blog :post="curation"
                avatar-class="min-w-35px min-h-35px w-2.2rem h-2.2rem md:w-3rem md:h-3rem">
            <template #bottom-btn-bar><div></div></template>
          </Blog>
        </div>
        <div v-if="contentType==='space'"
             class="h-140px md:h-10rem overflow-hidden relative my-10px">
          <Space :space="curation" class="rounded-15px h-full bg-tag-gradient"/>
        </div>
        <div class="flex justify-between items-center mt-1rem" @click.stop>
          <template v-if="showBtnGroup">
            <div v-if="!isEnd" class="flex-1 flex justify-end gap-x-24px">
              <!-- reply-->
              <button v-if="isReply" @click.stop="quoteOrReply"
                      class="text-white flex justify-center items-center w-24px h-24px rounded-full">
                <i v-if="isRepling" class="w-20px h-20px rounded-full bg-colorEA">
                  <img class="w-20px h-20px" src="~@/assets/icon-loading.svg" alt="">
                </i>
                <i v-else class="w-20px h-20px min-w-20px" :class="replyed?'btn-icon-reply-active':'btn-icon-reply'"></i>
              </button>
              <!-- quote-->
              <button v-if="isQuote" @click.stop="quoteOrReply"
                      class="text-white flex justify-center items-center w-20px h-20px rounded-full">
                <i v-if="isQuoting" class="w-20px h-20px rounded-full bg-colorEA">
                  <img class="w-20px h-20px" src="~@/assets/icon-loading.svg" alt="">
                </i>
                <i v-else class="w-20px h-20px min-w-20px" :class="quoted?'btn-icon-quote-active':'btn-icon-quote'"></i>
              </button>
              <!-- like-->
              <button v-if="isLike"
                      :disabled="isLiking"
                      @click.stop="like"
                      class="flex items-center">
                <i v-if="isLiking" class="w-20px h-20px rounded-full bg-colorEA">
                  <img class="w-20px h-20px" src="~@/assets/icon-loading.svg" alt="">
                </i>
                <i v-else class="w-20px h-20px min-w-20px" :class="liked?'btn-icon-like-active':'btn-icon-like'"></i>
              </button>
              <!-- follow-->
              <button v-if="isFollow"
                      :disabled="isFollowing"
                      @click.stop="follow"
                      class="flex items-center" >
                <i v-if="isFollowing" class="w-20px h-20px rounded-full bg-colorEA">
                  <img class="w-20px h-20px" src="~@/assets/icon-loading.svg" alt="">
                </i>
                <i v-else class="w-20px h-20px min-w-20px" :class="followed?'btn-icon-follow-active':'btn-icon-follow'"></i>
              </button>
            </div>
            <div v-else>
              <div v-if="curation.curatorProfile" class="flex items-center ml-10px">
                <img v-for="i of curation.curatorProfile" :key="i"
                     class="w-20px h-20px min-w-20px min-h-20px
                        2xl:w-1.2rem 2xl:h-1.2rem 2xl:min-w-1.2rem 2xl:min-h-1.2rem
                        rounded-full -ml-10px border-1 border-blockBg light:border-white"
                     @error="replaceEmptyImg"
                     :src="i" alt="">
                <span v-show="(curation.totalCount ?? 0) - 3 > 0"
                      class="min-w-20px px-4px h-20px min-w-20px min-h-20px xl:w-1.6rem xl:min-w-1.6rem xl:h-1.6rem xl:min-h-1.6rem
                    rounded-full -ml-10px flex justify-center items-center
                    border-1 border-blockBg bg-primaryColor
                    light:border-white light:bg-color62 light:text-white text-10px">
              +{{(curation.totalCount - 3)}}
            </span>
              </div>
            </div>
          </template>
          <div class="flex items-center justify-center ml-20px"
               :class="showBtnGroup?'':' absolute right-0 -top-2px'">
            <ChainTokenIcon class="bg-color62 p-2px"
                            height="16px" width="16px"
                            :chain-name="curation.chainId.toString()"
                            :token="{address: curation?.token, symbol: curation?.tokenSymbol}">
              <template #amount>
            <span class="px-8px h-20px whitespace-nowrap
                         flex items-center text-12px 2xl:text-0.8rem font-bold text-white">
              {{curation.amount.toString() / (10 ** curation.decimals)}} {{curation.tokenSymbol}}
            </span>
              </template>
            </ChainTokenIcon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import emptyAvatar from "@/assets/icon-default-avatar.svg";
import { parseTimestamp, sleep } from '@/utils/helper'
import { mapGetters } from "vuex";
import {formatEmojiText} from "@/utils/tool";
import Blog from "@/components/Blog";
import Repost from "@/components/Repost";
import Space from "@/components/Space";
import ChainTokenIcon from "@/components/ChainTokenIcon";
import {testData} from "@/views/square/test-data";
import { notify } from "@/utils/notify";
import { likeCuration, followCuration, checkMyCurationRecord } from "@/utils/curation";
import ContentTags from "@/components/ContentTags";
import { errCode } from "@/config";

export default {
  name: "CurationItem",
  components: {Blog,Repost, Space, ChainTokenIcon, ContentTags},
  props: {
    curation: {
      type: Object,
      default: {}
    },
    showBtnGroup: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      testData,
      enableFold: true,
      isFold: false,
      isLiking: false,
      isFollowing: false,
      isEnd: false,
      isQuoting: false,
      isRepling: false
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
    isLike() {
      if (!this.curation) return false;
      return (this.curation.tasks & 4) / 4
    },
    isFollow() {
      if (!this.curation) return false;
      return (this.curation.tasks & 8) / 8
    },
    quoted() {
      if(!this.curation || !this.getAccountInfo) return false
      return this.curation?.taskRecord & 1;
    },
    replyed() {
      if(!this.curation || !this.getAccountInfo) return false
      return (this.curation?.taskRecord & 2) / 2
    },
    liked() {
      if(!this.curation || !this.getAccountInfo) return false
      return (this.curation?.taskRecord & 4) / 4
    },
    followed() {
      if(!this.curation || !this.getAccountInfo) return false
      return (this.curation.taskRecord & 8) / 8
    },
  },
  methods: {
    formatEmojiText,
    replaceEmptyImg(e) {
      e.target.src = emptyAvatar;
    },
    checkLogin() {
      if(!this.getAccountInfo || !this.getAccountInfo.twitterId) {
        this.$store.commit('saveShowLogin', true)
        return false;
      }
      return true
    },
    gotoUserPage() {
      if (!this.getAccountInfo || this.curation.creatorTwitterUsername !== this.getAccountInfo.twitterUsername){
        this.$router.push({path : '/account-info/@' + this.curation.creatorTwitterUsername})
      }
    },
    async quoteOrReply() {
      if (!this.checkLogin() || this.quoted || this.replyed || this.isQuoting || this.isRepling) return

      let url;
      if (this.isQuote) {
        url = `https://twitter.com/intent/tweet?text=%0a%23iweb3&url=https://twitter.com/${this.curation.username}/status/${this.curation.tweetId}`
       this.isQuoting = true
      }else {
        url = `https://twitter.com/intent/tweet?in_reply_to=${this.curation.tweetId}&text=%0a%23iweb3`
        this.isRepling = true;
      }
      window.open(url, '__blank');

      await sleep(6)
      let count = 0;
      while(count++ < 50) {
        try {
          const record = await checkMyCurationRecord(this.getAccountInfo.twitterId, this.curation.curationId)
          if (record && record.taskRecord) {
            this.curation.taskRecord = record.taskRecord;
            if (this.isQuote && (record.taskRecord & 1 === 1)) {
              break;
            }
            if (this.isReply && (record.taskRecord & 2 === 2)) {
              break;
            }
          }
        }catch(e) {
          if (e === 'log out') {
            notify({message: this.$t('tips.accessTokenExpire')})
            break;
          }
        }
        await sleep(2)
      }
      this.isQuoting = false
      this.isRepling = false
    },
    async like() {
      if (!this.checkLogin() || this.liked || this.isLiking) return
      try{
        this.isLiking = true
        await likeCuration({...this.curation, twitterId: this.getAccountInfo.twitterId});
        this.curation.taskRecord = this.curation.taskRecord | 4
      } catch (e) {
        if (e === 'log out') {
          this.$store.commit('saveShowLogin', true)
          return;
        }else if (e === errCode.TWEET_NOT_FOUND) {
          notify({message: this.$t('tips.tweetNotFound'), type: "info", duration: 5000})
          return
        }
        notify({message:this.$t('err.serverErr'), type:'error'})
      } finally {
        this.isLiking = false
      }
    },
    async follow() {
      if (!this.checkLogin() || this.followed || this.isFollowing) return
      try{
        this.isFollowing = true
        await followCuration({...this.curation, twitterId: this.getAccountInfo.twitterId})
        this.curation.taskRecord = this.curation?.taskRecord | 8
      } catch (e) {
        if (e === 'log out') {
          this.$store.commit('saveShowLogin', true)
          return;
        }
        notify({message:this.$t('err.serverErr'), type:'error'})
      } finally {
        this.isFollowing = false
      }
    }
  },
  mounted() {
    // this.enableFold = this.$refs.blogRef?.clientHeight > 200
    this.isEnd = this.curation.curationStatus > 0
  }
}
</script>

<style scoped>

</style>
