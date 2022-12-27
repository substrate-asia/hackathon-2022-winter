<template>
  <div class="">
    <template v-if="currentShowingDetail">
      <div class="md:border-b-1 border-dividerColor mb-1rem">
        <div class="relative container mx-auto max-w-50rem md:px-1rem px-15px flex items-center md:justify-start justify-center h-2.8rem">
<!--          <img class="absolute left-1rem top-1/2 transform -translate-y-1/2 rotate-180 md:w-2.5rem w-2rem cursor-pointer"-->
<!--               @click="$router.back()"-->
<!--               src="~@/assets/icon-forward-circle.svg" alt="">-->
          <div class="c-text-black text-1.5rem md:text-1rem mx-1.9rem light:text-blueDark">{{$t('common.post')}}</div>
        </div>
      </div>
      <div class="container mx-auto max-w-50rem pb-2rem md:px-1rem md:bg-blockBg md:light:bg-white rounded-12px mb-1rem">
        <van-list :loading="listLoading"
                  :finished="listFinished"
                  :immediate-check="false"
                  :finished-text="$t('common.noMore')"
                  @load="onLoad">
          <Blog :post="currentShowingDetail" :isDetail='true'/>
          <div v-if="comments && comments.length > 0" class="px-1.5rem pt-1rem border-t-1 border-white/20 md:border-listBgBorder">
            <div class="c-text-black text-left text-1.2rem">Comments ( {{ comments ? comments.length : 0 }} )</div>
            <div class="mt-1rem pb-1.5rem" v-for="c of (comments || [])" :key="c.commentId">
              <Comment class="py-0.5rem" :comment="c"/>
            </div>
          </div>
        </van-list>
      </div>
    </template>

  </div>
</template>

<script>
import Blog from "@/components/Blog";
import Comment from '@/views/user/components/Comment'
import { mapState, mapGetters } from 'vuex'
import { getPostById, getCommentsByPostid } from '@/api/api'
import { getPosts } from '@/utils/steem'

export default {
  name: "PostDetail",
  components: {Blog, Comment},
  computed: {
    ...mapState('postsModule', ['currentShowingDetail']),
    ...mapGetters(['getAccountInfo'])
  },
  data() {
    return {
      listLoading: false,
      listFinished: false,
      refreshing: false,
      list: [1,2,3,4],
      comments: []
    }
  },
  mounted() {
    const postId = this.$route.params.postId
    // this.onLoad()
    if (!this.currentShowingDetail) {
      // get post
      getPostById(postId).then(async (p) => {
        const posts = await getPosts([p])
        this.$store.commit('postsModule/saveCurrentShowingDetail', posts[0])
        getCommentsByPostid(postId).then(async comments => {
          this.comments = await getPosts(comments.map(c => ({
            ...c,
            postId: c.commentId
          })))
        })
      })
    }else {
      getCommentsByPostid(postId).then(async comments => {
        this.comments = await getPosts(comments.map(c => ({
            ...c,
            postId: c.commentId
          })))
      })
    }
  },
  methods: {
    getData() {
      return new Promise(resolve => {
        const list = []
        setTimeout(() => {
          for (let i = 0; i < 4; i++) {
            list.push(list.length + 1);
          }
          resolve(list)
        }, 3000);
      })
    },

    // async onLoad() {
    //   if(this.listLoading || this.listFinished) return
    //   this.listLoading = true
    //   const res = await this.getData()
    //   if(this.refreshing) this.list = []
    //   this.listLoading = false
    //   this.refreshing = false
    //   this.list = this.list.concat(res)
    //   // 加载完成
    //   if (this.list.length >= 10) this.listFinished = true
    // },
    // onRefresh() {
    //   this.listFinished = false
    //   this.onLoad()
    // }
  },
  beforeDestroy () {
    this.$store.commit('postsModule/saveCurrentShowingDetail', null)
  },
}
</script>

<style scoped>

</style>
