<template>
  <div class="h-full flex flex-col overflow-hidden relative" id="square-index" ref="curationPageRef" @scroll="pageScroll">
    <div class="container px-15px mx-auto max-w-50rem md:max-w-48rem">
      <div class="flex py-20px">
        <button v-for="(tag, index) of subTagList" :key="index" v-show="index!==1"
                class="c-text-black text-16px leading-18px 2xl:text-0.8rem 2xl:leading-0.9rem whitespace-nowrap mr-50px"
                :class="subActiveTagIndex===index?'light:text-color18':'text-color59/50'"
                @click="changeSubIndex(index)">{{tag}}</button>
      </div>
    </div>
    <div class="flex-1 overflow-auto">
      <div class="c-text-black text-1.8rem mb-3rem min-h-1rem"
           v-if="refreshing && (!curationsList || curationsList.length === 0)">
        <img class="w-5rem mx-auto py-3rem" src="~@/assets/profile-loading.gif" alt="" />
      </div>
      <van-pull-refresh v-else
                        class="min-h-full"
                        v-model="refreshing"
                        @refresh="onRefresh"
                        :loading-text="$t('common.loading')"
                        :pulling-text="$t('common.pullRefresh')"
                        :loosing-text="$t('common.loosingRefresh')">
        <van-list :loading="listLoading"
                  :finished="listFinished"
                  :immediate-check="false"
                  :loading-text="$t('common.loading')"
                  :finished-text="curationsList.length!==0?$t('common.noMore'):''"
                  @load="onLoad">
          <div class="sm:px-15px sm:pt-1rem">
            <div class="container px-15px mx-auto max-w-50rem md:max-w-48rem"
                 :class="curationsList && curationsList.length>0?'md:p-1rem':''">
              <div v-if="curationsList && curationsList.length === 0"
                   class="py-3rem bg-blockBg light:bg-white rounded-12px shadow-card">
                <div class="c-text-black text-zinc-700 text-2rem mb-2rem">{{$t('common.none')}}</div>
                <div class="text-zinc-400 text-0.8rem leading-1.4rem p-3">
                  {{$t('curationsView.p2')}}
                </div>
              </div>
              <CurationItem v-for="(curation, index) of curationsList" :key="curation.curationId"
                            :curation="curation"
                            :content-type="curation.curationType === 1?'tweet':'space'"
                            @click="gotoDetail(curation)"/>
            </div>
          </div>
        </van-list>

      </van-pull-refresh>
    </div>
    <!-- <van-popup class="c-tip-drawer 2xl:w-2/5"
               v-model:show="modalVisible"
               :position="position">
      <div class="modal-bg w-full md:max-w-560px 2xl:max-w-28rem max-h-80vh 2xl:max-h-28rem overflow-auto flex flex-col rounded-t-1.5rem md:rounded-b-1.5rem pt-1rem md:py-2rem md:px-4rem">
        <div v-if="position === 'bottom'"
             @click="modalVisible=false"
             class="w-6rem h-8px bg-color73 rounded-full mx-auto mb-1rem"></div>
        <div class="flex-1 overflow-auto px-1.5rem no-scroll-bar">
          <CurationsTip class="py-2rem sm:py-0"
                        @confirm="onCreate"
                        @close="modalVisible=false"/>
        </div>
      </div>
    </van-popup> -->
    <button v-show="scroll>100"
            @click="$refs.curationPageRef.scrollTo({top: 0, behavior: 'smooth'})"
            class="flex items-center justify-center bg-color62
                   h-44px w-44px min-w-44px 2xl:w-2.2rem 2xl:min-w-2.2rem 2xl:h-2.2rem
                   rounded-full mt-0.5rem c-text-bold fixed bottom-2rem right-1.5rem sm:right-2.5rem z-9999">
      <img class="w-20px min-w-20px h-20px 2xl:w-1rem 2xl:h-1rem" src="~@/assets/icon-arrow-top.svg" alt="">
    </button>
  </div>
</template>

<script>
import CurationItem from "@/components/CurationItem";
import CurationsTip from "@/components/CurationsTip";
import { mapGetters, mapState } from 'vuex'
import { getCurations } from '@/api/api'
import { showError } from '@/utils/notify'

export default {
  name: "CurationsIndex",
  components: {CurationItem, CurationsTip},
  data() {
    return {
      listLoading: false,
      listFinished: false,
      refreshing: false,
      subTagList: ['Ongoing', 'Ended', 'Completed'],
      subActiveTagIndex: 0,
      subActiveTag: 'Ongoing',
      modalVisible: false,
      position: document.body.clientWidth < 768?'bottom':'center',
      scroll: 0
    }
  },
  computed: {
    ...mapGetters('curation', ['getDraft']),
    ...mapGetters(['getAccountInfo']),
    ...mapState('curation', ['ongoingList', 'endList', 'closeList']),
    curationsList() {
      if (this.subActiveTagIndex === 0) {
        return this.ongoingList
      }else if(this.subActiveTagIndex === 1) {
        return this.endList
      }else if(this.subActiveTagIndex === 2) {
        return this.closeList
      }
    }
  },
  // activated() {
  //   if(this.scroll > 0) this.$refs.curationPageRef.scrollTo({top: this.scroll})
  // },
  methods: {
    pageScroll() {
      this.scroll = this.$refs.curationPageRef.scrollTop
    },
    changeSubIndex(index) {
      if(this.subActiveTagIndex===index) return
      this.listFinished = false
      this.subActiveTagIndex = index
      this.onRefresh()
    },
    async onLoad() {
      if(this.refreshing || this.listLoading) return
      try{
        let curations;
        let time;
        const sel = this.subActiveTagIndex
        if (this.subActiveTagIndex === 0) {
          curations = this.ongoingList
          time = curations[curations.length - 1].createdTime
        }else if(this.subActiveTagIndex === 1) {
          curations = this.endList
          time = curations[curations.length - 1].endtime
        }else if(this.subActiveTagIndex === 2) {
          curations = this.closeList
          time = curations[curations.length - 1].endtime
        }
        if (!curations || curations.length === 0) {
          this.listFinished = true
          return;
        }
        
        const moreCurations = await getCurations(sel, time, this.getAccountInfo?.twitterId)
        if (moreCurations.length < 12) {
          this.listFinished = true
        }else {
          this.listFinished = false
        }
        curations = curations.concat(moreCurations);
        let mutationStr = ''
        if (sel === 0) {
          mutationStr = 'saveOngoingList'
        }else if(sel === 1) {
          mutationStr = 'saveEndList'
        }else if(sel === 2) {
          mutationStr = 'saveCloseList'
        }
        this.$store.commit('curation/'+mutationStr, curations)
      } catch(e) {
        console.log('Get more curations fail:', e);
        showError(501)
      } finally {
        this.listLoading = false
      }
    },
    async onRefresh() {
      this.refreshing = true
      try{
        let sel = this.subActiveTagIndex;
        let curations = await getCurations(sel, null, this.getAccountInfo?.twitterId)
        curations = curations;
        let mutationStr = ''
        if (sel === 0) {
          mutationStr = 'saveOngoingList'
        }else if(sel === 1) {
          mutationStr = 'saveEndList'
        }else if(sel === 2) {
          mutationStr = 'saveCloseList'
        }
        this.$store.commit('curation/'+mutationStr, curations ?? [])
        if (!curations || curations.length < 12) {
          this.listFinished = true
        }else {
          this.listFinished = false
        }
      } catch(e) {
        console.log('Refresh curations fail:', e);
        showError(501)
      } finally {
        this.refreshing = false
      }
    },
    gotoDetail(curation) {
      this.$store.commit('curation/saveDetailCuration', curation);
      this.$router.push('/curation-detail/' + curation.curationId);
    }
  },
  mounted () {
    console.log('mounted')
    this.onRefresh();
  },
  activated() {
    this.onRefresh()
  }
}
</script>

<style scoped>

</style>
