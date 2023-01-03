<template>
  <div class="w-full">
    <div class="bg-blockBg light:bg-white md:py-1.5rem rounded-12px sm:my-2rem">
      <div v-if="getAccountInfo && getAccountInfo.isRegistry === 1"
           class="px-1.5rem py-0.8rem text-14px flex">
        <div class="flex-1 flex flex-wrap gap-x-1.5rem gap-y-0.8rem">
          <span v-for="(tag, index) of subTagList" :key="index"
                class="leading-30px whitespace-nowrap px-1rem rounded-full border-1 h-30px cursor-pointer"
                :class="subActiveTagIndex===index?'bg-color62/20 light:bg-colorF1 text-color62 border-color62 font-bold':
                'border-color8B/30 light:border-colorE3 light:border-colorE3 text-color84 light:text-color7D light:bg-colorF2'"
                @click="changeSubIndex(index)">{{tag}}</span>
        </div>
      </div>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh"
                        :loading-text="$t('common.loading')"
                        :pulling-text="$t('common.pullRefresh')"
                        :loosing-text="$t('common.loosingRefresh')">
        <van-list class="px-1.5rem"
                  :loading="loading"
                  :finished="finished"
                  :immediate-check="false"
                  :finished-text="showingCurations.length>0?$t('common.noMore'):''"
                  :loosing-text="$t('common.pullRefresh')"
                  :loading-text="$t('common.loading')"
                  @load="onLoad">

          <div v-if="showingCurations.length===0 && !refreshing"
               class="py-3rem bg-blockBg light:bg-white rounded-12px">
            <div class="c-text-black text-color7D text-2rem mb-2rem">{{$t('common.none')}}</div>
          </div>
          <div class="c-text-black text-1.8rem mb-3rem min-h-1rem"
               v-if="refreshing && (!showingCurations || showingCurations.length === 0)">
            <img class="w-5rem mx-auto py-3rem" src="~@/assets/profile-loading.gif" alt="" />
          </div>
          <RelatedCurationItemVue class="bg-block light:bg-white border-1 border-color8B/30 light:border-colorE3
                                         cursor-pointer rounded-12px overflow-hidden mb-1rem"
                                  v-for="curation of showingCurations"
                        :key="curation.curationId"
                        :curation="curation"
                        :show-btn-group="false"
                        @click="gotoDetail(curation)">
            <template v-if="subActiveTagIndex===1" #status>
              <div class="ml-0.5rem text-12px 2xl:text-0.75rem">
                <!-- notTweeted: 'Not Tweeted',
                comfirmReward: 'Confirm Reward',
                partiallyConfirmed: 'Partially Confirmed',
                allConfirmed: 'All Confirmed' -->
                <button v-if="curation.createStatus===0"
                        @click.stop="showTweetTip(curation)"
                        class="h-20px px-6px rounded-full bg-colorF1 text-color8B light:text-color7D">
                  {{$t('curation.notTweeted')}}
                </button>
                <button v-else-if="curation.curationStatus===0"
                        disabled
                        class="h-20px px-6px rounded-full bg-colorF1">
                  <span class="gradient-text gradient-bg-color3">{{$t('curation.ongoing')}}</span>
                </button>
                <button v-else-if="curation.curationStatus === 1"
                        class="h-20px px-6px rounded-full bg-colorF1 text-color8B light:text-color7D"
                        @click.stop="gotoReward(curation)">
                  {{$t('curation.comfirmReward')}}
                </button>
                <button v-else-if="curation.curationStatus===2"
                        disabled
                        class="h-20px px-6px rounded-full bg-colorF1 text-color8B light:text-color7D">
                  {{$t('curation.allConfirmed')}}
                </button>
              </div>
            </template>
          </RelatedCurationItemVue>
        </van-list>
      </van-pull-refresh>
    </div>
    <van-popup class="c-tip-drawer 2xl:w-2/5"
               v-model:show="modalVisible"
               :position="position">
      <div class="modal-bg w-full md:w-560px 2xl:max-w-28rem
      max-h-80vh 2xl:max-h-28rem overflow-auto flex flex-col
      rounded-t-1.5rem md:rounded-b-1.5rem pt-1rem md:py-2rem">
        <div class="flex-1 overflow-auto px-1rem xl:px-2.5rem no-scroll-bar pt-1rem pb-2rem md:py-0">
          <TweetAndStartCuration :curation-content="detailCuration.content"
                                 :curation-id="detailCuration.curationId"
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
import CurationItem from "@/components/CurationItem";
import RelatedCurationItemVue from "@/components/RelatedCurationItem.vue";
import { getMyJoinedCurations, getMyCreatedCurations } from "@/api/api"
import { mapState, mapGetters } from 'vuex'
import TweetAndStartCuration from "@/components/TweetAndStartCuration";
import { CURATION_SHORT_URL } from '@/config'
import { sortCurations } from '@/utils/helper'

export default {
  name: "Curations",
  components: {CurationItem, TweetAndStartCuration, RelatedCurationItemVue},
  data() {
    return {
      subTagList: ['Attended', 'Created'],
      subActiveTagIndex: 0,
      refreshing: true,
      loading: false,
      finished: false,
      pageSize: 10,
      list: [],
      position: document.body.clientWidth < 768?'bottom':'center',
      modalVisible: false,
      detailCuration: null,
      filterKey: 'latest'
    }
  },
  computed: {
    ...mapState(['joinedCurations', 'createdCurations']),
    ...mapGetters(['getAccountInfo']),
    showingCurations() {
      if(this.subActiveTagIndex === 0) {
        return this.joinedCurations
      }else {
        return this.createdCurations
      }
    }
  },
  mounted() {
    this.onRefresh()
  },
  methods: {
    onPost() {
       // transfer text to uri
       const content = this.detailCuration.content + ' #iweb3\n' + this.$t('curation.moreDetail') +  ' => ' + CURATION_SHORT_URL + this.detailCuration.curationId
      // if (content.length > 280) {
      //   notify({message: this.$t('tips.textLengthOut'), duration: 5000, type: 'error'})
      //   return;
      // }

      let url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(content)
      window.open(url, '__blank')
      this.modalVisible = false
    },
    showTweetTip(curation) {
      this.detailCuration = curation
      this.modalVisible = true
    },
    changeSubIndex(index) {
      this.finished = true;
      this.subActiveTagIndex = index
      this.onRefresh()
    },
    async onRefresh() {
      this.finished = true;
      this.refreshing = true;
      try{
        let curations = [];
        let m;
        const twitterId = this.getAccountInfo.twitterId;
        if (this.subActiveTagIndex === 0) {
          m = getMyJoinedCurations;
        }else {
          m = getMyCreatedCurations;
        }
        const newCuration = await m(twitterId);
        if (newCuration && newCuration.length > 0) {
          curations = newCuration
        }
        if (this.subActiveTagIndex === 0) {
          this.$store.commit('saveJoinedCurations', curations)
        }else {
          this.$store.commit('saveCreatedCurations', curations)
        }
        if (!curations || curations.length < 12) {
          this.finished = true
        }else {
          this.finished = false
        }
      } catch(e) {
        console.log('Refersh my curations fail:', e);
      } finally {
        this.refreshing = false;
      }
    },
    async onLoad() {
      console.log('on load');
      this.finished = false;
      this.loading = true;
      try{
        let curations = [];
        let m;
        const twitterId = this.getAccountInfo.twitterId;
        let endtime;
        if (this.subActiveTagIndex === 0) {
          curations = this.joinedCurations;
          m = getMyJoinedCurations;
          if (curations && curations.length > 0) {
            endtime = curations[curations.length - 1].joinTime
          }
        }else {
          curations = this.createdCuration;
          m = getMyCreatedCurations;
          if (curations && curations.length > 0) {
            endtime = curations[curations.length - 1].createdTime
          }
        }
        const newCuration = await m(twitterId, endtime);
        if (newCuration && newCuration.length > 0) {
          curations = curations.concat(newCuration)
        }
        if (this.subActiveTagIndex === 0) {
          this.$store.commit('saveJoinedCurations', curations)
        }else {
          this.$store.commit('saveCreatedCurations', curations)
        }
        if (!newCuration || newCuration.length < 12) {
          this.finished = true
        }else {
          this.finished = false
        }
      } catch(e) {
        console.log('Load more my curations fail:', e);
      } finally {
        this.loading = false;
      }
    },
    gotoDetail(curation) {
      if (!curation.tweetId) {
        return;
      }
      this.$store.commit('curation/saveDetailCuration', curation);
      this.$router.push('/curation-detail/' + curation.curationId);
    },
    gotoReward(curation) {
      this.$store.commit('curation/saveDetailCuration', curation);
      this.$router.push('/confirm-reward')
    }
  }
}
</script>

<style scoped>

</style>
