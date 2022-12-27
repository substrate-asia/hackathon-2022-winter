<template>
  <div class="h-full overflow-auto" id="square-index">
    <div >
      <van-list :loading="listLoading"
                :finished="listFinished"
                :immediate-check="false"
                :loading-text="$t('common.loading')"
                :finished-text="$t('common.noMore')"
                @load="onLoad">
        <div class="px-1rem pt-25px sm:px-0 container mx-auto max-w-53rem md:max-w-48rem">
          <div class="flex sm:items-center sm:justify-between">
            <div class="w-min relative ">
              <div class="w-full h-7px gradient-line absolute bottom-3px rounded-full"></div>
              <span class="text-2rem leading-2.5rem md:text-2.4rem md:leading-3rem c-text-black relative whitespace-nowrap light:text-blueDark">{{$t('square')}}</span>
            </div>
            <button class="flex items-center justify-center gradient-btn gradient-btn-shadow h-2.7rem px-1rem rounded-full c-text-black text-1.2rem
                    absolute bottom-2rem left-1/2 transform -translate-x-1/2 z-2"
                    @click="publishTweet">
              {{$t('postView.tweetPost')}}
            </button>
          </div>
          <div class="text-color8B light:text-color7D mt-10px text-left leading-20px">{{$t('squareView.p1')}}</div>
        </div>
        <div class="border-b-1px border-dividerColor light:border-dividerColorLight mt-0.5rem sticky bg-primaryBg light:bg-primaryBgLight -top-1px z-2 sm:px-1rem">
          <div class="px-1.5rem sm:px-0 container mx-auto max-w-53rem md:max-w-48rem flex justify-between items-center">
            <div class="flex-1 overflow-x-auto no-scroll-bar">
              <div class="text-14px 2xl:text-0.9rem w-min flex gap-1.5rem h-3rem">
              <span v-for="(tag, index) of tagList" :key="index"
                    class="whitespace-nowrap leading-3rem cursor-pointer hover:text-primaryColor transform hover:font-bold hover:scale-110"
                    :class="currentTagIndex===index?'text-white light:text-blueDark border-b-4px border-primaryColor':'text-color8B light:text-color7D'"
                    @click="onTagChange(index)">{{tag === 'iweb3' ? 'All' : ('#' + tag)}}</span>
              </div>
            </div>
            <router-link class="pl-1rem" to="/square/topics">
              <i class="w-2rem h-2rem icon-forward-circle"></i>
            </router-link>
          </div>
        </div>
        <div class="sm:mt-1rem sm:px-1rem">
          <div class="container mx-auto max-w-53rem md:max-w-48rem sm:bg-blockBg light:sm:bg-white rounded-12px" :class="currentPosts && currentPosts.length>0?'md:p-1rem':''">
            <div class="px-1.5rem border-b-1px border-white/20 sm:border-b-0 py-0.8rem text-14px flex flex-wrap gap-x-1.5rem gap-y-0.8rem ">
              <span v-for="(tag, index) of subTagList" :key="index"
                    class="leading-27px whitespace-nowrap px-0.8rem rounded-full font-500 h-27px cursor-pointer"
                    :class="subActiveTagIndex===index?'gradient-bg text-white':'border-1 border-white/40 light:border-colorE3 text-color84 light:text-color7D light:bg-colorF2'"
                    @click="changeSubIndex(index)">{{tag}}</span>
            </div>
            <div class="c-text-black text-1.8rem mb-3rem min-h-1rem" v-if="refreshing && (!currentPosts || currentPosts.length === 0)">
              <img class="w-5rem mx-auto py-3rem" src="~@/assets/profile-loading.gif" alt="" />
            </div>
            <div v-else-if="!listLoading && currentPosts && currentPosts.length === 0" class="py-3rem bg-blockBg light:bg-transparent rounded-12px">
              <div class="c-text-black text-zinc-700 light:text-color7D text-2rem mb-2rem">{{$t('common.none')}}</div>
              <div class="text-zinc-400 text-0.8rem leading-1.4rem p-3">
                {{$t('squareView.p2')}}
              </div>
            </div>
            <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh"
                              :loading-text="$t('common.loading')"
                              :pulling-text="$t('common.pullRefresh')"
                              :loosing-text="$t('common.loosingRefresh')"
            >
              <div class="" v-for="p of currentPosts" :key="p.postId">
                <Blog @click="gotoDetail(p)"
                      :post="p" class="bg-blockBg light:bg-white sm:bg-transparent sm:border-b-1 sm:border-listBgBorder mb-1rem md:mb-0"/>
              </div>
            </van-pull-refresh>
          </div>
        </div>
      </van-list>
      <van-popup class="c-tip-drawer 2xl:w-2/5" v-model:show="modalVisible"
                 :position="position">
        <div class="modal-bg w-full md:min-w-560px max-h-80vh 2xl:max-h-28rem overflow-auto flex flex-col rounded-t-1.5rem md:rounded-b-1.5rem pt-1rem md:p-2rem">
          <div v-if="position === 'bottom'"
               @click="modalVisible=false"
               class="w-6rem h-8px bg-color73 rounded-full mx-auto mb-1rem"></div>
          <div class="flex-1 overflow-auto px-1.5rem no-scroll-bar">
            <PostTip v-if="getAccountInfo" class="pb-2rem text-left"/>
            <Login v-else class="text-center sm:my-1rem mb-2rem"/>
          </div>
        </div>
      </van-popup>
    </div>
  </div>
</template>

<script>
import Blog from "@/components/Blog";
import Login from "@/views/Login";
import PostTip from "@/views/post/PostTip";
import { getTagAggregation, getUserFavTag, getPostsByTagTime, getPostsByTagValue, getPostByTrend } from '@/api/api';
import { mapState, mapGetters } from 'vuex'
import { notify, showError } from "@/utils/notify";
import { getPosts } from '@/utils/steem'

export default {
  components: {Blog, Login, PostTip},
  data() {
    return {
      subTagList: ['Trend', 'New', 'Value'],
      subActiveTagIndex: 1,
      listLoading: true,
      listFinished: false,
      refreshing: false,
      list: [],
      position: document.body.clientWidth < 768?'bottom':'center',
      modalVisible: false,
      scroll: 0
    }
  },
  computed: {
    ...mapState('postsModule', ['tagsAggregation', 'allPosts', 'currentTagIndex', 'allPostsTagValue', 'allPostsTagTrend']),
    ...mapGetters(['getAccountInfo']),
    ...mapGetters('postsModule', ['getPostsByTag', 'getPostsByTagValue', 'getPostsByTagTrend']),
    tagList() {
      if (this.tagsAggregation) {
        return Object.keys(this.tagsAggregation)
      }else {
        return ['iweb3']
      }
    },
    currentPosts() {
      if (this.subActiveTagIndex === 0) {
        const postsByTag = this.getPostsByTagTrend(this.tagList[this.currentTagIndex])
        if (postsByTag && postsByTag.posts) {
          return postsByTag.posts
        }
        return []
      }else if (this.subActiveTagIndex === 1){
        return this.getPostsByTag(this.tagList[this.currentTagIndex])
      }else if(this.subActiveTagIndex === 2) {
        const postsByTag = this.getPostsByTagValue(this.tagList[this.currentTagIndex])
        if (postsByTag && postsByTag.posts) {
          return postsByTag.posts
        }
        return []
      }
    }
  },
  mounted() {
    const referee = this.$route.params.referee;
    if (referee) {
      this.$store.commit('saveReferee', referee);
    }
  },
  activated() {
    document.getElementById('square-index').scrollTo({top: this.scroll})
  },
  watch: {
    currentTagIndex(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.listFinished = false
        this.onRefresh()
      }
    }
  },
  methods: {
    publishTweet(){
      this.modalVisible=true

      // if (this.getAccountInfo){
      //   this.modalVisible=true
      // }else {
      //   this.$router.push('/login')
      // }
    },
    changeSubIndex(index) {
      this.subActiveTagIndex = index
      this.listFinished = false
      this.onRefresh()
    },
    async onLoad() {
      if(this.listLoading || this.listFinished) return
      try{
        this.listLoading = true
        const tag = this.tagList[this.currentTagIndex]
        if (this.subActiveTagIndex === 0) {
          let postsTag = this.getPostsByTagTrend(tag);
          if (!postsTag) return;
          const pageNum = postsTag.pageNum ?? 0
          let posts = await getPostByTrend(tag, 16, pageNum);
          posts = await getPosts(posts)
          postsTag.pageNum = pageNum + 1;
          postsTag.posts = postsTag.posts.concat(posts)
          this.allPostsTagTrend[tag] = postsTag
          this.$store.commit('postsModule/saveAllPostsTagTrend', this.allPostsTagTrend)
          if (posts.length < 16) {
            this.listFinished = true
          }else {
            this.listFinished = false
          }
        }
        if (this.subActiveTagIndex === 1) {
          const posts = this.getPostsByTag(tag)
          let time;
          if (posts && posts.length > 0) {
            time = posts[posts.length - 1].postTime
          }
          const res = await getPostsByTagTime(tag, 16, time, false)
          const postsf = await getPosts(res)
          this.allPosts[tag] = (this.allPosts[tag] || []).concat(postsf)
          this.$store.commit('postsModule/saveAllPosts', this.allPosts)
          if (postsf.length < 16) {
            this.listFinished = true
          }else {
            this.listFinished = false
          }
        } else if(this.subActiveTagIndex === 2) {
          let postsTag = this.getPostsByTagValue(tag);
          if (!postsTag) return;
          const pageNum = postsTag.pageNum ?? 0
          let posts = await getPostsByTagValue(tag, 16, pageNum);
          posts = await getPosts(posts)
          postsTag.pageNum = pageNum + 1;
          postsTag.posts = postsTag.posts.concat(posts)
          this.allPostsTagValue[tag] = postsTag
          this.$store.commit('postsModule/saveAllPostsTagValue', this.allPostsTagValue)
          if (posts.length < 16) {
            this.listFinished = true
          }else {
            this.listFinished = false
          }
        }
      } catch (e) {
        console.log(555, e);
        this.listFinished = true
        showError(501)
      } finally {
        this.listLoading = false
      }
    },
    async onRefresh() {
      try{
        this.refreshing = true
        this.listLoading = false
        const tag = this.tagList[this.currentTagIndex]
        if (this.subActiveTagIndex === 0) {
          // by tag and post value
          let posts = await getPostByTrend(tag);
          posts = await getPosts(posts)
          this.allPostsTagTrend[tag] = {
            pageNum: 1,
            posts
          }
          this.listLoading = false
          this.$store.commit('postsModule/saveAllPostsTagTrend', this.allPostsTagTrend)
        }else if (this.subActiveTagIndex === 1) {
          const posts = this.getPostsByTag(tag)
          let time;
          if (posts && posts.length > 0) {
            time = posts[0].postTime.replace('T', ' ')
            time = time.slice(0, 19)
          }
          const res = await getPostsByTagTime(tag, 16, time, true)
          const postsf = await getPosts(res)
          this.allPosts[tag] = postsf.concat(this.allPosts[tag] || [])
          this.listLoading = false
          this.$store.commit('postsModule/saveAllPosts', this.allPosts)
        }else if (this.subActiveTagIndex === 2) {
          // by tag and post value
          let posts = await getPostsByTagValue(tag);
          posts = await getPosts(posts)
          this.allPostsTagValue[tag] = {
            pageNum: 1,
            posts
          }
          this.listLoading = false
          this.$store.commit('postsModule/saveAllPostsTagValue', this.allPostsTagValue)
        }
      } catch (e) {
        console.log(321, e);
        showError(501)
      } finally {
        this.refreshing = false
      }
    },
    onTagChange(index) {
      if(index === this.currentTagIndex) return
      this.$store.commit('postsModule/saveCurrentTagIndex', index)
      // const posts = this.getPostsByTag(this.tagList[index])
      // this.listFinished = false
      // this.onRefresh()
      // this.$router.push(`/square/tag/${this.tagList[index]}`)
    },
    gotoDetail(p) {
      let el = document.getElementById('square-index');
      this.scroll = el.scrollTop
      this.$store.commit('postsModule/saveCurrentShowingDetail', p)
      this.$router.push(`/post-detail/${p.postId}`)
    }
  }
}
</script>

<style scoped>

</style>
