<template>
  <div class="text-14px xl:text-0.8rem">
    <!-- title -->
    <div class="container mx-auto max-w-50rem pb-2rem pt-1rem">
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-1.5rem">
        <div class="col-span-1 xl:col-span-2 px-15px">
          <div class="h-min min-h-146px text-left rounded-12px overflow-hidden relative">
            <!-- curation info -->
            <div v-if="detailCuration">
              <div v-if="detailCuration.creatorTwitter !== detailCuration.authorId" class="flex items-center mb-1rem">
                <img class="w-42px min-w-42px h-42px md:w-3rem md:h-3rem md:w-min-3rem
                            mr-15px md:mr-1rem rounded-full cursor-pointer"
                     @error="replaceEmptyImg"
                     @click="gotoUserPage(detailCuration && detailCuration.creatorTwitterUsername)"
                     :src="detailCuration.creatorProfileImg && detailCuration.creatorProfileImg.replace('normal', '200x200')" alt="">
                <div >
                  <div class="flex justify-center items-center">
                  <span class="c-text-black text-18px 2xl:text-0.8rem leading-18px 2xl:leading-1rem mr-0.8rem cursor-pointer"
                        @click="gotoUserPage(detailCuration && detailCuration.creatorTwitterUsername)">
                    {{detailCuration && detailCuration.creatorTwitterName}}
                  </span>
                    <ContentTags :is-quote="isQuote" :is-reply="isReply" :content-type="contentType"/>
                  </div>
                  <div class="text-12px 2xl:text-0.7rem text-color8B light:text-color7D leading-18px 2xl:leading-1.1rem">
                    @{{detailCuration && detailCuration.creatorTwitterUsername}}
                  </div>
                </div>
              </div>
              <template v-if="contentType==='tweet'">
                <Blog :post="detailCuration" @click="gotoTweet"
                      avatar-class="w-30px min-w-30px h-30px md:w-2.4rem md:h-2.4rem md:w-min-2.4rem"
                      class="border-1 border-color8B/30 light:border-black px-15px pt-10px pb-15px rounded-15px">
                  <template #bottom-btn-bar><div></div></template>
                </Blog>
              </template>
              <template v-else-if="contentType==='space'">
                <Space :space="space" @click="gotoTweet"
                       class="h-146px md:min-h-10rem dark:bg-tag-gradient light:bg-color15 rounded-15px cursor-pointer "></Space>
              </template>
              <template v-else>
                <div class="px-1.25rem pb-2rem border-b-1 border-color8B/30">
                  <div class="c-text-black text-1.5rem sm:text-24px">
                    {{title}}
                  </div>
                  <div class="flex items-center flex-wrap gap-1rem mt-1rem">
                    <span class="px-10px py-6px bg-white/10 rounded-full text-12px lg:text-0.7rem leading-18px">
                      {{status}}
                    </span>
                        <span class="px-10px py-6px bg-white/10 rounded-full text-12px lg:text-0.7rem leading-18px">
                      {{time}}
                    </span>
                  </div>
                </div>
              </template>
            </div>
            <div v-if="loading1"
                 class="bg-color62/20 absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <img class="w-5rem mx-auto" src="~@/assets/profile-loading.gif" alt="" />
            </div>
          </div>
          <!-- tips -->
          <div class="border-0 light:border-1 gradient-border gradient-border-color91 mt-1rem rounded-15px overflow-hidden">
            <div class="h-min bg-color62 text-white text-left cursor-pointer tip-bg">
              <div class="text-white light:text-blueDark pl-60px sm:pl-60px pr-18px font-bold min-h-54px
                        flex-1 flex justify-between items-center truncate relative"
                   @click.stop="showTipModal">
                <el-carousel v-if="tips && tips.length>0"
                             class="w-full hidden sm:block"
                             height="54px" indicator-position="none" :loop="true"
                             direction="vertical" :autoplay="true"
                             :interval="2500">
                  <el-carousel-item v-for="item in tips" :key="item" class="flex items-center">
                    <div class="flex-1 c-text-black text-12px xl:text-0.7rem text-white">{{tipStr(item)}}</div>
                  </el-carousel-item>
                </el-carousel>
                <van-notice-bar class="w-full bg-transparent px-0 sm:hidden"
                                scrollable :speed="100"
                                v-if="tips && tips.length>0">
                  <template #default>
                    <span v-for="item in tips" :key="item"
                          class="mr-4rem c-text-black text-12px xl:text-0.7rem text-white">{{tipStr(item)}}</span>
                  </template>
                </van-notice-bar>
                <span v-else class="text-14px absolute w-full h-full top-0 left-0 flex items-center justify-center font-bold text-white">
                {{ detailCuration?.curationType == 1 ? this.$t('curation.tipToUser', {user: detailCuration.username}) : this.$t('curation.tipToSpeaker') }}
              </span>
                <button v-if="top3Tip && top3Tip.length > 0" @click.stop="tipCollapse=!tipCollapse"
                        class="ml-10px bg-black rounded-full text-white h-24px min-w-60px flex items-center justify-center
                             leading-18px text-12px 2xl:text-0.7rem 2xl:leading-0.8rem px-3px">Top3</button>
              </div>
              <el-collapse-transition>
                <div v-show="tipCollapse" class="pb-10px px-18px">
                  <div class="px-25px py-6px bg-white text-black rounded-10px">
                    <div class="h-32px flex justify-between items-center text-12px"
                         v-for="(tip, index) of top3Tip" :key="'tops' + tip.hash">
                      <div class="flex items-center">
                        <img class="w-18px" :src="top3Icons[index]" alt="">
                        <span>{{tip.fromUsername}}</span>
                      </div>
                      <span>{{tip.amount}} STEEM</span>
                    </div>
                  </div>
                </div>
              </el-collapse-transition>
            </div>
          </div>

          <!-- popups -->
          <template v-if="contentType==='space' && (space.spaceState === 2 || (space.spaceState > 2 && popups.length>0))">
            <PopUpsCard :popups="popups" :space="space" :showCreate="space.spaceState === 2" @createPopUpVisible='createPopUpVisible=true'></PopUpsCard>
          </template>
          <!-- quests -->
          <div class="h-min bg-blockBg px-18px py-12px light:bg-black text-white light:border-1 light:border-colorE3
                      rounded-12px overflow-hidden text-left mt-1rem">
            <div class="flex justify-between items-center">
              <div class="h-40px flex items-center c-text-black">
                <span class="text-16px xl:text-0.9rem whitespace-nowrap">
                  {{ isQuote === 1 ? 'Quote': 'Reply' }} to Earn
                </span>
                <button class="ml-20px" @click="quotesCollapse=!quotesCollapse">
                  <img class="w-14px"
                       :class="quotesCollapse?'transform rotate-180':''"
                       src="~@/assets/icon-arrow.svg" alt="">
                </button>
              </div>
              <img v-if="(quoted+replyed+liked+followed)===(isQuote+isReply+isLike+isFollow)"
                   class="w-26px min-w-26px"
                   src="~@/assets/icon-progress-down.svg" alt="">
              <el-progress v-else type="circle" width="26"
                           color="#7851FF"
                           class="task-progress"
                           stroke-width="2"
                           :percentage="(quoted+replyed+liked+followed)/(isQuote+isReply+isLike+isFollow)*100">
                <span class="text-white text-12px">{{quoted+replyed+liked+followed}}/{{isQuote+isReply+isLike+isFollow}}</span>
              </el-progress>
            </div>
            <el-collapse-transition>
              <div v-show="quotesCollapse"
                   :class="endAndNotComplete?'opacity-90':''"
                   class="text-white py-0.5rem font-bold">
                <button @click="quoteOrReply"
                        :disabled="endAndNotComplete"
                        class="bg-color1D w-full min-h-40px py-11px px-12px flex items-center rounded-10px mb-10px">
                  <i v-if="isQuoting || isRepling" class="w-16px h-16px rounded-full bg-colorEA mr-10px">
                    <img class="w-16px h-16px" src="~@/assets/icon-loading.svg" alt="">
                  </i>
                  <template v-else>
                    <i v-if="isQuote===1" class="w-16px min-w-16px h-16px mr-10px"
                       :class="quoted?'btn-icon-quote-active':'btn-icon-quote'"></i>
                    <i v-else class="w-16px min-w-16px h-16px mr-10px"
                       :class="replyed?'btn-icon-reply-active':'btn-icon-reply'"></i>
                  </template>
                  <span class="text-12px xl:text-0.7rem leading-18px 2xl:leading-0.9rem">Click to {{isQuote === 1 ? 'Quote' : 'Reply'}}</span>
                </button>
                <button v-if="isLike" @click="like" :disabled="endAndNotComplete"
                        class="bg-color1D w-full min-h-40px py-11px px-12px flex items-center rounded-10px mb-10px">
                  <i v-if="isLiking" class="w-16px h-16px rounded-full bg-colorEA mr-10px">
                    <img class="w-16px h-16px" src="~@/assets/icon-loading.svg" alt="">
                  </i>
                  <i v-else class="w-16px min-w-16px h-16px mr-10px"
                     :class="liked?'btn-icon-like-active':'btn-icon-like'"></i>
                  <span class="text-12px xl:text-0.7rem text-left leading-14px">
                      Like (or Verify your Like)
                  </span>
                </button>
                <button v-if="isFollow" @click="follow" :disabled="endAndNotComplete"
                        class="bg-color1D w-full min-h-40px py-11px px-12px flex items-center rounded-10px mb-10px">
                  <i v-if="isFollowing" class="w-16px h-16px rounded-full bg-colorEA mr-10px">
                    <img class="w-16px h-16px" src="~@/assets/icon-loading.svg" alt="">
                  </i>
                  <i v-else class="w-16px min-w-16px h-16px mr-10px"
                     :class="followed?'btn-icon-follow-active':'btn-icon-follow'"></i>
                  <span class="text-12px xl:text-0.7rem text-left leading-14px">
                      Follow @{{detailCuration.username}} (or Verify your Follow)
                    </span>
                </button>
              </div>
            </el-collapse-transition>
            <div v-if="!quotesCollapse" class="w-full h-1px bg-color8B/30 light:bg-colorE3 mb-16px"></div>
            <div class="flex items-center justify-between h-40px xl:h-2rem">
              <div class="flex items-center ml-11px">
                <div class="-ml-11px" v-for="p of participant.slice(0,3)" :key="p">
                  <img v-if="p.profileImg"
                       class="w-28px min-w-28px h-28px xl:w-1.2rem xl:min-w-1.2rem xl:h-1.2rem rounded-full
                              border-2 border-color62 light:border-white"
                       @error="replaceEmptyImg"
                       :src="p.profileImg" alt="">
                  <img v-else
                       class="w-28px min-w-28px h-28px xl:w-1.2rem xl:min-w-1.2rem xl:h-1.2rem rounded-full
                              border-2 border-color62 light:border-white"
                       src="~@/assets/icon-default-avatar.svg" alt="">

                </div>
                <span v-if="participant.length>3"
                      class=" min-w-28px h-28px xl:min-w-1.2rem xl:h-1.2rem rounded-full px-4px
                             rounded-full -ml-10px flex justify-center items-center
                             border-2 border-blockBg bg-primaryColor
                             light:border-white light:bg-color62 light:text-white text-10px">+{{ participant[0].totalCount - 3 }}</span>
                <button class="ml-10px whitespace-nowrap" v-if="participant.length>0" @click="showSubmissions=true">
                  {{$t('curation.allParticipants')}} >>
                </button>
              </div>
              <ChainTokenIconVue height="18px" width="18px" class="bg-color62 p-2px"
                                 :token="{symbol: detailCuration?.tokenSymbol, address: detailCuration?.token}"
                                 :chainName="detailCuration ? detailCuration.chainId?.toString() : ''">
                <template #amount>
                      <span v-if="detailCuration?.curationStatus > 0 && (detailCuration?.taskRecord === detailCuration?.tasks)" class="px-8px h-17px whitespace-nowrap flex items-center text-12px 2xl:text-0.8rem font-bold">
                        {{formatAmount(detailCuration?.myRewardAmount / (10 ** detailCuration?.decimals))+'/'+formatAmount(detailCuration?.amount / ( 10 ** detailCuration?.decimals)) + " " + detailCuration?.tokenSymbol}}
                      </span>
                      <span v-else class="px-8px h-17px whitespace-nowrap flex items-center text-12px 2xl:text-0.8rem font-bold">
                        {{formatAmount(detailCuration?.amount / ( 10 ** detailCuration?.decimals)) + " " + detailCuration?.tokenSymbol}}
                      </span>
                </template>
              </ChainTokenIconVue>
            </div>
          </div>
          <!-- Details -->
          <div class="c-text-black mt-18px mb-10px text-16px leading-16px text-left">{{$t('curation.details')}}</div>
          <div class="light:text-color21 text-left leading-18px text-12px mb-14px whitespace-pre-line">{{detailCuration?.description}}</div>
          <div class="h-min border-1 border-color8B/30 light:border-black
                      rounded-15px overflow-hidden relative">
            <div class="px-1.25rem py-13px text-left relative">
              <div class="flex justify-between items-center">
                <span class="text-16px 2xl:text-0.9rem c-text-black">Prize</span>
                <button class="h-26px xl:1.3rem px-1rem bg-primaryColor/20 light:bg-black light:text-white text-color62 rounded-6px">
                  {{detailCuration ? formatAmount(detailCuration.amount / (10 ** detailCuration.decimals)) + ' ' + detailCuration.tokenSymbol : ''}}
                </button>
              </div>
              <!-- ended -->
              <div v-if="detailCuration?.endtime < (new Date().getTime() / 1000)" class="flex justify-between items-center mt-1rem">
                <span class="text-16px 2xl:text-0.9rem c-text-black">End Time</span>
                <button class="h-26px xl:1.3rem px-1rem bg-color62/20 border-1 border-color62 light:text-black text-color7D rounded-5px ">
                  {{endtime}}
                </button>
              </div>
              <!-- ongoing -->
              <div v-else class="flex justify-between items-center mt-1rem">
                <span class="text-16px 2xl:text-0.9rem c-text-black">Expiration</span>
                <button class="h-26px xl:1.3rem px-1rem border-1 border-color52 light:text-black  rounded-5px">
                  {{endtime}}
                </button>
              </div>
              <div v-if="loading1"
                   class="bg-color62/20 absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center rounded-12px">
                <img class="w-5rem mx-auto" src="~@/assets/profile-loading.gif" alt="" />
              </div>
            </div>
            <template v-if="contentType==='space'">
              <div class="text-left mt-1rem relative">
                <SpeakerCollapse :space="space"/>
                <div v-if="loading5"
                     class="bg-color62/20 absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center rounded-12px">
                  <img class="w-5rem mx-auto" src="~@/assets/profile-loading.gif" alt="" />
                </div>
              </div>
            </template>
          </div>
          <template v-if="detailCuration">
            <!-- Related Curations mobile -->
            <div v-if="relatedCurations && relatedCurations.length > 0"
                 class="border-t-1 border-color8B/30 light:border-colorE3 mt-2rem pt-1rem">
              <div class="text-left text-14px 2xl:text-1rem font-bold mb-1rem">{{$t('curation.relatedCurations')}}</div>
              <div class="mb-1rem"
                   @click="gotoCuration(rc)"
                   v-for="rc of relatedCurations" :key="rc.curationId">
                <RelatedCurationItemVue class="bg-block light:bg-white border-1 border-color8B/30 light:border-colorE3
                                             rounded-12px overflow-hidden"
                                        :curation="rc">
                </RelatedCurationItemVue>
              </div>
            </div>
            <div class="min-h-100px relative mt-1rem" v-if="loading1">
              <div class="bg-color62/20 absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center rounded-12px">
                <img class="w-5rem mx-auto" src="~@/assets/profile-loading.gif" alt="" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- modals -->
    <van-popup class="c-tip-drawer 2xl:w-2/5"
               v-model:show="modalVisible"
               :position="position">
      <div class="modal-bg w-full md:w-560px 2xl:max-w-28rem
      max-h-80vh 2xl:max-h-28rem overflow-auto flex flex-col
      rounded-t-1.5rem md:rounded-b-1.5rem pt-1rem md:py-2rem">
        <div class="flex-1 overflow-auto px-1rem xl:px-2.5rem no-scroll-bar">
          <TweetAttendTip class="py-2rem md:py-0"
                          :curation="detailCuration"
                          @close="modalVisible=false"/>
        </div>
      </div>
    </van-popup>
    <van-popup class="md:w-600px bg-black light:bg-transparent"
               :class="position==='center'?'rounded-12px':'rounded-t-12px'"
               v-model:show="showSubmissions"
               :position="position">
      <transition name="el-zoom-in-bottom">
        <div v-if="showSubmissions"
             class="dark:bg-glass light:bg-white rounded-t-12px">
          <Submissions :records="participant" :state="detailCuration.curationStatus" @close="showSubmissions=false"></Submissions>
        </div>
      </transition>
    </van-popup>
    <van-popup class="md:w-600px bg-black light:bg-transparent"
               :class="position==='center'?'rounded-12px':'rounded-t-12px'"
               v-model:show="showTip"
               :position="position">
      <transition name="el-zoom-in-bottom">
        <div v-if="showTip"
             class="relative dark:bg-glass light:bg-colorF7 rounded-t-12px overflow-hidden min-h-60vh">
          <button class="absolute right-20px top-24px"
                  @click="showTip=false">
            <i class="w-18px h-18px 2xl:w-1rem 2xl:h-1rem icon-close"></i>
          </button>
          <TipModalVue class="pt-70px 2xl:pt-3.5rem h-60vh"
                       :tipToUser="detailCuration"
                       :parent-tweet-id="detailCuration.tweetId"
                       @close="showTip=false"
                       @back="showTip=false"></TipModalVue>
        </div>
      </transition>
    </van-popup>
    <van-popup class="md:w-600px bg-black light:bg-transparent"
               :class="position==='center'?'rounded-12px':'rounded-t-12px'"
               v-model:show="speakerTipVisible"
               :position="position">
      <transition name="el-zoom-in-bottom">
        <div v-if="speakerTipVisible"
             class="relative dark:bg-glass light:bg-colorF7 rounded-t-12px overflow-hidden">
          <SpeakerTipModal class="h-60vh"
                           :space="space"
                           :parentTweetId="detailCuration.tweetId"
                           @close="speakerTipVisible=false"/>
        </div>
      </transition>
    </van-popup>
    <van-popup class="md:w-600px bg-black light:bg-transparent"
               :class="position==='center'?'rounded-12px':'rounded-t-12px'"
               v-model:show="createPopUpVisible"
               :position="position">
      <transition name="el-zoom-in-bottom">
        <div v-if="createPopUpVisible"
             class="relative dark:bg-glass light:bg-colorF7 rounded-t-12px overflow-hidden min-h-80vh">
          <CreatePopUpModal @close="createPopUpVisible=false"/>
        </div>
      </transition>
    </van-popup>
  </div>
</template>

<script>
import TweetAttendTip from "@/components/TweetAttendTip";
import { mapState, mapGetters } from "vuex";
import { getCurationById, getCurationRecord, popupsOfCuration, popupRecords,
   getSpaceInfoById, getCurationsOfTweet, getAllTipsOfCuration } from "@/api/api";
import { getDateString, parseTimestamp, formatAmount, parseTimestampToUppercase, sleep } from '@/utils/helper'
import emptyAvatar from "@/assets/icon-default-avatar.svg";
import { ERC20List, errCode, EVM_CHAINS } from "@/config";
import {onCopy} from "@/utils/tool";
import Submissions from "@/views/curations/Submissions";
import {formatEmojiText} from "@/utils/tool";
import Blog from "@/components/Blog";
import ChainTokenIconVue from "@/components/ChainTokenIcon.vue";
import Space from "@/components/Space";
import CurationItem from "@/components/CurationItem";
import RelatedCurationItemVue from "@/components/RelatedCurationItem.vue";
import SpeakerCollapse from "@/components/SpeakerCollapse";
import SpeakerTipModal from "@/components/SpeakerTipModal";
import CreatePopUpModal from "@/components/CreatePopUpModal";
import PopUpsCard from "@/components/PopUpsCard";
import TipModalVue from "@/components/TipModal.vue";
import { notify } from "@/utils/notify";
import { newPopups, likeCuration, followCuration, checkMyCurationRecord} from '@/utils/curation'
import iconTop1 from '@/assets/icon-top1.svg'
import iconTop2 from '@/assets/icon-top2.svg'
import iconTop3 from '@/assets/icon-top3.svg'
import ContentTags from "@/components/ContentTags";

export default {
  name: "CurationDetail",
  components: {
    TweetAttendTip, Submissions, Blog, Space, TipModalVue,
    CurationItem, SpeakerCollapse, SpeakerTipModal,RelatedCurationItemVue,
    CreatePopUpModal, PopUpsCard, ChainTokenIconVue,ContentTags
  },
  data() {
    return {
      position: document.body.clientWidth < 768?'bottom':'center',
      modalVisible: false,
      showSubmissions: false,
      isExpand: false,
      loading1: false, // curation total
      loading2: false, // particpant
      loading3: false, // popups
      loading4: false, // tips
      loading5: false, // space info
      loading: false,
      participant: [],
      space: {},
      popups: [],
      tips: [],
      relatedCurations: [],
      speakerTipVisible: false,
      createPopUpVisible: false,
      showTip: false,
      updateInterval: null,
      timeIntrerval: null,
      tipCollapse: false,
      quotesCollapse: true,
      isQuoting: false,
      isRepling: false,
      isLiking: false,
      isFollowing:false,
      top3Icons: [iconTop1, iconTop2, iconTop3],
      endtime: ''
    }
  },
  computed: {
    ...mapState('curation', ['detailCuration', 'getPendingPopup']),
    ...mapGetters(['getAccountInfo']),
    title() {
      if (this.detailCuration && this.detailCuration.content) {
        return this.detailCuration.content.split('\n')[0].slice(0, 50)
      }else{
        return '---'
      }
    },
    contentType() {
      if (!this.detailCuration) return 'space';
      return this.detailCuration.curationType === 1 ? 'tweet' : 'space'
    },
    content() {
      if (this.detailCuration && this.detailCuration.content) {
        return this.detailCuration.content
      }else{
        return '---'
      }
    },
    // 已结束未完成
    endAndNotComplete() {
      return this.detailCuration?.endtime < (new Date().getTime() / 1000)
      return this.participant.length > 3  &&
          ((this.quoted+this.replyed+this.liked+this.followed)<
              (this.isQuote+this.isReply+this.isLike+this.isFollow))
      // return true
    },
    isQuote() {
      if (!this.detailCuration) return false;
      return this.detailCuration.tasks & 1;
    },
    isReply() {
      if (!this.detailCuration) return false;
      return (this.detailCuration.tasks & 2) / 2
    },
    isLike() {
      if (!this.detailCuration) return false;
      return (this.detailCuration.tasks & 4) / 4
    },
    isFollow() {
      if (!this.detailCuration) return false;
      return (this.detailCuration.tasks & 8) / 8
    },
    quoted() {
      if(!this.detailCuration || !this.getAccountInfo) return false
      return this.detailCuration?.taskRecord & 1;
    },
    replyed() {
      if(!this.detailCuration || !this.getAccountInfo) return false
      return (this.detailCuration?.taskRecord & 2) / 2
    },
    liked() {
      if(!this.detailCuration || !this.getAccountInfo) return false
      return (this.detailCuration?.taskRecord & 4) / 4
    },
    followed() {
      if(!this.detailCuration || !this.getAccountInfo) return false
      return (this.detailCuration.taskRecord & 8) / 8
    },
    status() {
      if (!this.detailCuration) return ''
      const curationStatus = this.detailCuration.curationStatus;
      const createStatus = this.detailCuration.createStatus;
      if (createStatus === 0) {
        return this.$t('curation.invalidStatus')
      }else{
        if (curationStatus === 0) {
          return this.$t('curation.ongoing')
        }else if(curationStatus === 1) {
          return this.$t('curation.end')
        } else if (curationStatus === 2) {
          return this.$t('curation.complete')
        }
      }
    },
    showReward() {
      if (!this.detailCuration) return false;
      const curationStatus = this.detailCuration.curationStatus;
      const createStatus = this.detailCuration.createStatus;
      if (createStatus && curationStatus > 0) {
        return true;
      }
      return false;
    },
    tokenIcon() {
      const token = this.detailCuration && this.detailCuration.token
      if(!token) return
      for (let t of ERC20List) {
        if(token === t.address) {
          return t.icon
        }
      }
      return
    },
    top3Tip() {
      if (this.tips && this.tips.length > 0) {
        const steemTips = this.tips.filter(t => t.chainName == 'STEEM');
        return steemTips.sort((a, b) => b.amount - a.amount).slice(0, 3)
      }
      return []
    },
    time() {
      if (!this.detailCuration || !this.detailCuration.createdTime || !this.detailCuration.endtime) return '';
      const local = new Date().getTimezoneOffset() / -60;
      let start = new Date(this.detailCuration.createdTime);
      let end = new Date(this.detailCuration.endtime * 1000)
      return getDateString(start, local, 0) + ' ~ ' + getDateString(end, local, 0)
    }
  },
  watch: {
    $route(newValue, oldValue) {
      const newId = this.$route.params.id;
      if (this.$route.name == 'curation-detail' && newId && newId.match(/^[0-9a-fA-F]+$/)) {
        this.loadCuration()
      }
    }
  },
  methods: {
    formatEmojiText,
    onCopy,
    formatAmount,
    gotoTweet() {
      window.open('https://twitter.com/' + this.detailCuration.username + '/status/' + this.detailCuration.tweetId)
    },
    createTime(p) {
      if (!this.detailCuration || !this.detailCuration.createdTime || !this.detailCuration.endtime) return '';
      return parseTimestamp(p.createAt)
    },
    replaceEmptyImg(e) {
      e.target.src = emptyAvatar;
    },
    gotoUserPage(username) {
        this.$router.push({path : '/account-info/@' + username})
    },
    tipStr(tip) {
      if (tip.chainName === 'STEEM') {
        return `@${tip.fromUsername} tips ${tip.emoji ? (tip.emoji + '(' + tip.amount + ' STEEM)') : (tip.amount + ' STEEM')} to @${tip.toUsername}`
      }else {
        let chainName;
        for (let chain in EVM_CHAINS) {
          if (EVM_CHAINS[chain].id === parseInt(tip.chainName)) {
            chainName = chain;
            break;
          }
        }
        return `@${tip.fromUsername} tips ${formatAmount(tip.amount / (10 ** tip.decimals))} ${tip.symbol}(${chainName}) to @${tip.toUsername}`
      }
    },
    checkLogin() {
      if(!this.getAccountInfo || !this.getAccountInfo.twitterId) {
        this.$store.commit('saveShowLogin', true)
        let count = 0
        const interval = setInterval(() => {
          if (count++ > 60) {
            clearInterval(interval);
            return;
          }
          if (this.getAccountInfo && this.getAccountInfo.twitterId) {
            this.loadCuration()
            clearInterval(interval)
          }
        }, 1000);
        return false;
      }
      return true
    },
    showTipModal() {
      if (!this.checkLogin() || !this.detailCuration) return
      if (this.detailCuration.curationType === 1) {
        this.showTip=true
      }else
        this.speakerTipVisible=true
    },
    async quoteOrReply() {
      if (!this.checkLogin()) return
      if (this.isRepling || this.isQuoting || this.quoted || this.replyed) return;
      let url;
      if (this.isQuote) {
        this.isQuoting = true
        url = `https://twitter.com/intent/tweet?text=%0a%23iweb3&url=https://twitter.com/${this.detailCuration.username}/status/${this.detailCuration.tweetId}`
      }else {
        this.isRepling = true;
        url = `https://twitter.com/intent/tweet?in_reply_to=${this.detailCuration.tweetId}&text=%0a%23iweb3`
      }
      window.open(url, '__blank');

      await sleep(6)
      let count = 0;
      while(count++ < 50) {
        try {
          const record = await checkMyCurationRecord(this.getAccountInfo.twitterId, this.detailCuration.curationId)
          if (record && record.taskRecord) {
            this.detailCuration.taskRecord = record.taskRecord
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
        await likeCuration({...this.detailCuration, twitterId: this.getAccountInfo.twitterId});
        this.detailCuration.taskRecord = this.detailCuration.taskRecord | 4
      } catch (e) {
        if (e === 'log out') {
          this.$store.commit('saveShowLogin', true)
          return;
        }else if (e === errCode.TWEET_NOT_FOUND) {
          notify({message: this.$t('tips.tweetNotFound'), type: 'info', duration: 5000})
          return;
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
        await followCuration({...this.detailCuration, twitterId: this.getAccountInfo.twitterId})
        this.detailCuration.taskRecord = this.detailCuration?.taskRecord | 8
      } catch (e) {
        if (e === 'log out') {
          this.$store.commit('saveShowLogin', true)
          return;
        }
        notify({message:this.$t('err.serverErr'), type:'error'})
      } finally {
        this.isFollowing = false
      }
    },
    gotoCuration(curation) {
      const id = curation.curationId
      this.$store.commit('curation/saveDetailCuration', {})
      this.participant = [];
      this.space = {};
      this.popups = [];
      this.tips = [];
      this.relatedCurations = [];
      this.$router.replace('/curation-detail/' + id);
    },
    updateCurationInfos() {
      if (this.detailCuration && this.detailCuration.curationId) {
        const id = this.detailCuration.curationId;
        // update curation paricipant info
        getCurationRecord(id).then(res => {
          this.participant = res ?? []
        }).catch(console.log).finally(() => {
          this.loading2 = false
        })

        // update popup info
        popupsOfCuration(this.getAccountInfo?.twitterId, id).then(res => {
          this.popups = res
        }).catch(console.log).finally(() => {
          this.loading3 = false
        })

        // update tip info
        getAllTipsOfCuration(id).then(res => {
          if (!res) return;
          if(this.contentType === 'space') {
            this.tips = res
          }else {
            this.tips = res.filter(r => {
              return r.toTwitterId === this.detailCuration.authorId
            })
          }
        })

        // update space host profile
        if (this.detailCuration.spaceId) {
          getSpaceInfoById(this.detailCuration.spaceId).then(res => {
            if (res && res.spaceId) {
              this.space = res
            }
          }).finally(() => {
            this.loading5 = false;
          })
        }else {
          this.loading5 = false
        }
      }
    },
    async loadCuration() {
      const id = this.$route.params.id;
      const account = this.getAccountInfo

      if (this.getPendingPopup) {
        newPopups(pendingPopup).then(res => {
        }).catch(e => {
          if (e === 'log out') {
            notify({message: this.$t('tips.accessTokenExpire'), type:'info'})
          }
        }).finally(() => {
          // this.$store.commit('curation/savePendingPopup', null)
        })
      }

      if (this.detailCuration && this.detailCuration.curationId === id) {
        this.updateCurationInfos()
        await sleep(3)
      }else {
        this.$store.commit('curation/saveDetailCuration', null)
        this.loading1 = true
        this.loading2 = true
        this.loading3 = true
        this.loading4 = true
        this.loading5 = true
      }
      getCurationById(id, account?.twitterId).then(res => {
        if (res) {
          getCurationsOfTweet(res.tweetId).then(res => {
            const cs = res ?? []
            this.relatedCurations = cs.filter(c => c.curationId !== this.detailCuration.curationId)
          })
          this.$store.commit('curation/saveDetailCuration', res)
          this.updateCurationInfos()
        }
      }).catch(e => {console.log('Get curation fail:', e);}).finally(() => {
        this.loading1 = false
      })
    }
  },
  mounted () {
    this.loadCuration()
    this.updateInterval = setInterval(this.updateCurationInfos, 10000);
    this.timeIntrerval = setInterval(() => {
      this.endtime = parseTimestampToUppercase(this.detailCuration?.endtime)
    }, 1000)
  },
  beforeUnmount () {
    clearInterval(this.updateInterval)
    clearInterval(this.timeIntrerval)
  },
  unmounted() {
    clearInterval(this.updateInterval)
    clearInterval(this.timeIntrerval)
  }
}
</script>

<style scoped lang="scss">
.expand-box {
  transition: max-height 500ms;
}
.icon-share {
  background-image: url("~@/assets/icon-share-white.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  &:hover {
    background-image: url("~@/assets/icon-share-primary.svg");
  }
  &:focus {
    background-image: url("~@/assets/icon-share-primary.svg");
  }
}
.light .icon-share {
  background-image: url("~@/assets/icon-share-light.svg");
  &:hover {
    background-image: url("~@/assets/icon-share-primary.svg");
  }
  &:focus {
    background-image: url("~@/assets/icon-share-primary.svg");
  }
}
.tip-bg {
  background-image: url("~@/assets/tips-img.svg");
  background-repeat: no-repeat;
  background-size: 24px 24px;
  background-position: 18px 15px;
}
.token-tag {
  clip-path: polygon(20px 0, 100% 0, 100% 100%, 0 100%);
}
</style>
