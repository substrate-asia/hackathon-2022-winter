<template>
  <div class="border-1 border-listBgBorder bg-white/10 rounded-12px overflow-hidden md:max-w-35rem">
    <div class="" v-if="post && post.author">
      <div class="p-0.6rem">
        <div class="flex items-center">
          <img v-if="post && post.author && post.author.profile_image_url"
               class="w-2rem h-2rem md:mr-1rem mr-0.8rem rounded-full gradient-border border-2px cursor-pointer"
               @error="replaceEmptyImg"
               :src="post.author.profile_image_url" alt="">
          <img class="w-2rem h-2rem md:mr-1rem mr-0.8rem rounded-full gradient-border border-2px" src="@/assets/icon-default-avatar.svg" v-else alt="">
          <div class="flex-1 flex flex-col items-start">
            <div class="flex items-center flex-wrap  text-0.8rem">
              <a class="c-text-black text-left leading-1.1rem mr-3 light:text-blueDark">{{ post.author.name }}</a>
              <!-- <img class="w-1rem h-1rem mx-0.5rem" src="~@/assets/icon-checked.svg" alt=""> -->
              <span class="text-color8B light:text-color7D">@{{ post.author.username }}</span>
            </div>
            <span class="whitespace-nowrap overflow-ellipsis overflow-x-hidden text-color8B light:text-color7D text-0.7rem leading-1.5rem">
            {{ parseTimestamp(post.createdAt) }}
          </span>
          </div>
        </div>
        <div class="overflow-x-hidden">
          <div class="text-left font-400 mt-0.5rem">
            <p class="cursor-pointer text-12px leading-20px 2xl:text-0.8rem 2xl:leading-1.6rem text-color8B light:text-blueDark">
              {{ post.text }}
            </p>
            <!-- <p v-show="urls && urls.length > 0" v-for="u of urls" :key="u">
              <a :href="u"
                 class="text-blue-500" target="_blank">
                {{ u }}
              </a>
            </p> -->
          </div>
        </div>
      </div>
      <div class="grid mt-10px" :class="`img-`+(imgurls.length%5)" v-if="imgurls && imgurls.length > 0">
        <div class="img-box" v-for="(url, index) of imgurls.slice(0,4)" :key="url">
          <img @click.stop="viewImg(index)" :src="url" alt="">
        </div>
      </div>
    </div>
    <el-dialog class="c-img-dialog" v-model="imgViewDialog" :fullscreen="true" title="&nbsp;">
      <el-carousel height="70vh" indicator-position="none" :autoplay="false" :initial-index="imgIndex">
        <el-carousel-item v-for="item in imgurls" :key="item">
          <img class="absolute transform top-1/2 left-1/2  -translate-y-1/2 -translate-x-1/2 max-h-70vh"
               :src="item" alt="">
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
  </div>
</template>

<script>
import { parseTimestamp, formatPrice } from '@/utils/helper'
import { mapState, mapGetters } from 'vuex'
import { ImagePreview } from 'vant';
import emptyAvatar from "@/assets/icon-default-avatar.svg";

export default {
  name: "Blog",
  props: {
    retweetInfo: {
      type: String,
      default: {}
    },
  },
  data() {
    return {
      like: true,
      urls: [],
      imgurls: [],
      allurls: [],
      url: null,
      reg: '',
      post: {},
      urlreg: '',
      imgViewDialog: false,
      imgIndex: 0
    }
  },
  computed: {
    ...mapState(['accountInfo']),
    ...mapGetters(['getAccountInfo']),
  },
  methods: {
    replaceEmptyImg(e) {
      e.target.src = emptyAvatar;
    },
    parseTimestamp(time) {
      return parseTimestamp(time)
    },
    viewImg(index) {
      if(navigator.userAgent.toUpperCase().indexOf('IPHONE')>=0 ||
          navigator.userAgent.toUpperCase().indexOf('ANDROID')>=0) {
        ImagePreview({
          images: this.imgurls,
          startPosition: index
        });
      } else {
        this.imgIndex = index
        this.imgViewDialog = true
      }
    }
  },
  mounted () {
    this.post = JSON.parse(this.retweetInfo)

    this.urlreg = /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_#@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/g
    this.reg = /(https?:[^:<>"]*\/)([^:<>"]*)(\.((png!thumbnail)|(png)|(jpg)|(webp)))/g
    const urls = this.post.text.replace(' ', '').replace('\r', '').replace('\t', '').match(this.urlreg)
    this.allurls = urls
    this.imgurls = this.post.images

    // remove urls display if there

    if (urls && this.imgurls) {
      this.urls = urls.filter(u => this.imgurls.indexOf(u) < 0)
    } else if(urls) {
      this.urls = urls
    }
  },
}
</script>

<style scoped lang="scss">
.img-box {
  overflow: hidden;
  width: 100%;
  padding-top: 57%;
  position: relative;
  img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.img-1 {
  grid-template-columns: repeat(1, 1fr);
}
.img-2 {
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
}
.img-3 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  :nth-child(2) {
    grid-column: 2 / 2;
    grid-row: 1 / 3;
  }
}
.img-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
}
.blog-tag{
  border-radius: 0.4rem;
  padding: .2rem .5rem 0.2rem 0.8rem;
  border: 1px solid #434343;
  background-color: rgba(white, .1);
  background-image: linear-gradient(to bottom, var(--gradient-primary-color1), var(--gradient-primary-color2));
  background-size: 0.3rem 100%;
  background-repeat: no-repeat;
}
@media (max-width: 500px) {
  .img-3 {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    :nth-child(2) {
      grid-column: 2 / 2;
      grid-row: 1 / 3;
    }
  }
}
</style>
