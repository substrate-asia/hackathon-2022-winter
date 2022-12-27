<template>
  <div class="text-left border-1 border-listBgBorder bg-white/10 rounded-12px overflow-hidden lg:max-w-3/4"
       :class="imgPosition==='left'?'flex':''">
    <template v-if="imgPosition==='left'">
      <div class="flex-0.3 img-left-box">
        <img :src="linkPreviewInfo.images && linkPreviewInfo.images[0]" alt="">
      </div>
      <div class=" w-1px bg-color8B/30"></div>
    </template>
    <img v-else class="w-full object-cover" :src="linkPreviewInfo.images && linkPreviewInfo.images[0]" alt="">
    <div class="flex-1 px-1rem py-0.5rem text-14px leading-24px 2xl:text-0.9rem 2xl:leading-1.8rem text-color8B light:text-blueDark overflow-hidden">
      <div class="h-full flex flex-col justify-center">
        <div class="">{{getUrlHost(linkPreviewInfo.url)}}</div>
        <div class="c-text-black text-white overflow-hidden overflow-ellipsis whitespace-nowrap">{{linkPreviewInfo.title}}</div>
        <div class="text-line-3">{{linkPreviewInfo.description}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LinkPreview",
  props: {
    pageInfo: {
      type: String,
      default: "{}"
    }
  },
  data() {
    return {
      linkPreviewInfo: {
        url: 'https://twitter.com/terry3t1/status/1542338002818666496',
        image: 'https://pbs.twimg.com/media/FWd8DdiX0AAwfEN.jpg:large',
        title: 'terry3t.eth on Twitter',
        desc: '“Siguniang mountain, here we are。 （!post by https://t.co/ybMGq2pJM9） #iweb3'
      },
      imgPosition: 'top',
      loading: true
    }
  },
  methods: {
    getImgSize(imgUrl) {
      const img = new Image()
      img.src = imgUrl
      img.onload = () => {
        if(img.height/img.width > 0.8) {
          this.imgPosition = 'left'
        }
      }
    },
    getUrlHost(link) {
      try{
        const url = new URL(link)
        return url.host.toLowerCase() || ''
      }catch(e) {
        return link
      }
    }
  },
  mounted () {
    this.linkPreviewInfo = JSON.parse(this.pageInfo);
    if(this.linkPreviewInfo.images) this.getImgSize(this.linkPreviewInfo.images[0])
  },
}
</script>

<style scoped lang="scss">
.text-line-3 {
  word-break: break-word;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
.img-left-box {
  overflow: hidden;
  width: 30%;
  padding-top: 30%;
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
</style>
