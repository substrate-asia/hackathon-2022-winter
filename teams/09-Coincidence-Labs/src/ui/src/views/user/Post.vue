<template>
  <div class="grid grid-cols-1 xl:grid-cols-3 md:gap-1rem pb-2rem text-14px xl:text-0.8rem">
    <div class="col-span-1 xl:col-start-3 xl:col-end-4
                light:bg-social-token-box light:bg-no-repeat light:bg-cover
                border-1 border-dividerColor
                px-1rem rounded-12px xl:my-2rem md:mb-0 sm:mx-0 mt-1rem mb-1.5rem
                h-min overflow-hidden mx-1.5rem">
      <div class="border-b-1 border-color84/30 light:border-colorE0/80
                  py-11px flex items-center justify-between xl:justify-center">
        <span class="text-center font-600 xl:text-left xl:font-500 xl:w-full light:text-white">{{$t('postView.socialToken')}}</span>
        <div class="xl:hidden flex-1 flex justify-end items-center">
          <span class="text-colorB5 light:text-colorE0/80 mr-1rem whitespace-nowrap">{{ steemBalance }} STEEM</span>
          <span class="text-white c-text-black">{{ steemValue}} </span>
        </div>
      </div>
      <div class="mt-2rem xl:mt-1rem mb-1.5rem">
        <div class="hidden xl:block md:mb-1rem text-right">
          <div class="text-colorB5 light:text-colorE0/80 mb-0.5rem">{{ steemBalance }} STEEM</div>
          <div class="text-1.6rem text-white">{{ steemValue}} </div>
        </div>
        <div class="flex items-center xl:flex-col">
          <div class="flex justify-between items-center xl:w-full">
            <div class="flex items-center justify-center">
              <span class="text-color8B light:text-white whitespace-nowrap">
                {{$t('postView.resourceCredits')}}
              </span>
              <el-tooltip popper-class="shadow-popper-tip">
                <template #content>
                  <div class="max-w-14rem text-white light:text-blueDark">
                    {{$t('postView.p1')}}
                  </div>
                </template>
                <button>
                  <img class="min-w-12px w-1rem ml-0.5rem" src="~@/assets/icon-warning-white.svg" alt="">
                </button>
              </el-tooltip>
            </div>
            <span class="hidden xl:block c-text-black text-16px 2xl:text-1.1rem text-white">{{rcPercent}}%</span>
          </div>
          <div class="flex-1 ml-17px flex justify-end xl:w-full xl:ml-0">
            <el-progress class="c-progress flex-1 max-w-200px xl:w-full xl:max-w-full xl:mt-10px"
                         :text-inside="false"
                         :stroke-width="10"
                         :show-text="false"
                         :percentage="Number(rcPercent)"/>
            <span class="xl:hidden font-bold ml-10px text-white" style="color: #E0D2FF">{{rcPercent}}%</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-span-1 xl:col-start-1 xl:col-end-3 xl:row-start-1 xl:mt-2rem w-full ">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh"
                        loading-text="Loading"
                        pulling-text="Pull to refresh data"
                        loosing-text="Release to refresh">
        <van-list :loading="loading"
                  :finished="finished"
                  :immediate-check="false"
                  :finished-text="$t('common.noMore')"
                  @load="onLoad">
          <div class="c-text-black text-1.8rem mb-3rem min-h-1rem"
               v-if="refreshing && (!posts || posts.length === 0)">
            <img class="w-5rem mx-auto py-3rem" src="~@/assets/profile-loading.gif" alt="" />
          </div>
          <div v-if="posts.length===0 && !refreshing"
               class="py-3rem bg-blockBg light:bg-white rounded-12px">
            <div v-if="getAccountInfo && getAccountInfo.isPending">
              <div class="text-zinc-400 text-0.8rem leading-1.4rem">
                {{$t('postView.p10')}}
              </div>
              <div class="flex items-center justify-center mt-2rem">
                <button class="flex items-center justify-center gradient-btn gradient-btn-shadow h-2.7rem px-1rem
                    rounded-full mt-0.5rem c-text-bold bottom-2rem left-1/2 transform-translate-x-1/2 z-2 w-8rem"
                    @click="$router.push('/signup')">
                    {{$t('common.active')}}
                </button>
              </div>
            </div>
            <div v-else class="px-1.5rem">
              <div class="c-text-black text-color7D text-2rem mb-2rem">{{$t('common.none')}}</div>
              <div class="text-zinc-400 text-0.8rem leading-1.4rem">
                {{$t('postView.p7')}}
              </div>
            </div>
          </div>
          <div class="bg-blockBg light:bg-white rounded-12px overflow-hidden">
            <div class="" v-for="p of posts" :key="p.postId">
              <Blog @click="goteDetail(p)"
                    :post="p"
                    class="border-b-1 border-white/20 light:border-black/16 md:border-listBgBorder px-1.5rem py-1rem"/>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import Blog from "@/components/Blog";
import { mapState, mapGetters } from 'vuex'
import { getUsersPosts } from '@/api/api'
import { sleep, formatPrice } from '@/utils/helper'
import { getPost, getPosts, getAccountRC } from '@/utils/steem'

export default {
  name: "Transaction",
  components: {Blog},
  computed: {
    ...mapState(['accountInfo', 'posts', 'rcPercent', 'steemBalance', 'prices']),
    ...mapGetters(['getAccountInfo']),
    steemValue() {
      return formatPrice(this.steemBalance * this.prices['steem'])
    }
  },
  data() {
    return {
      refreshing: true,
      loading: false,
      finished: false,
      pageSize: 10,
      pageIndex: 0,
      scroll: 0
    }
  },
  async mounted () {
    while(!this.getAccountInfo || !this.getAccountInfo.twitterUsername){
      if (this.getAccountInfo && this.getAccountInfo.isPending) {
        break;
      }
      await sleep(1)
    }
    if (this.getAccountInfo.steemId) {
      getAccountRC(this.getAccountInfo.steemId).then(rc => {
        this.$store.commit('saveRcPercent', parseFloat(rc[0] / rc[1] * 100).toFixed(2))
      }).catch()
    }else {
      this.$store.commit('saveRcPercent',100.00)
    }
  },
  async activated() {
    // document.getElementById('user-index').scrollTo({top: this.scroll})
    while(!this.getAccountInfo || !this.getAccountInfo.twitterUsername){
      if (this.getAccountInfo && this.getAccountInfo.isPending) {
        this.refreshing = false
        return;
      }
      await sleep(1)
    }
    if(!this.posts || this.posts.length === 0) {
      this.onRefresh()
    }
  },
  methods: {
    onRefresh() {
      console.log('refresh')
      this.refreshing = true
      let time;
      if (this.posts && this.posts.length > 0) {
        time = this.posts[0].postTime
      }

      getUsersPosts(this.getAccountInfo.twitterId, this.pageSize, time, true).then(async (res) => {
        const posts = await getPosts(res)
        this.$store.commit('savePosts', posts.concat(this.posts))
        this.refreshing = false
      }).catch(e => {
        this.refreshing = false
      })
    },
    onLoad() {
      console.log('load more')
      if (this.finished || this.loading) return;
      let time;
      if (this.posts && this.posts.length > 0) {
        this.loading = true
        time = this.posts[this.posts.length - 1].postTime
        getUsersPosts(this.getAccountInfo.twitterId, this.pageSize, time, false).then(async (res) => {
         const posts = await getPosts(res)
          this.$store.commit('savePosts', this.posts.concat(posts))
          if (res.length < this.pageSize) {
            this.finished = true
          }
          this.loading = false
        }).catch(e => {
          this.loading = false
          this.finished = true
        })
      }
    },
    goteDetail(p) {
      // let el = document.getElementById('user-index');
      // this.scroll = el.scrollTop
      this.$store.commit('postsModule/saveCurrentShowingDetail', p)
      this.$router.push(`/post-detail/${p.postId}`)
    }
  }
}
</script>

<style scoped>
.top-box {
  background: linear-gradient(99.28deg, rgba(83, 83, 83, 0.8) 0.41%, rgba(78, 72, 61, 0.8) 75.78%);
  border: 1px solid #323436;
  border-radius: 12px;
}

</style>
