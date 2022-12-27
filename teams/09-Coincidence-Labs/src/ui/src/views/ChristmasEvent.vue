<template>
  <div class="christmas-page" ref="christmasRef">
    <div class="relative h-full w-full flex flex-col justify-center items-center">
      <button class="fixed top-60px right-20px z-9 bg-white/30 h-40px w-40px rounded-full flex items-center justify-center"
              @click="onPlay">
        <img v-if="!isPaused" class="w-35px" src="~@/assets/icon-play.svg" alt="">
        <img v-else class="h-30px music-icon" src="~@/assets/icon-music.svg" alt="">
      </button>
      <img class="bg-light h-full" src="~@/assets/christmas/light.png" alt="">
      <div class="tree-box tree-box-web" id="tree-box">
        <img class="w-full h-full bg-web" src="~@/assets/christmas/tree-web.gif" alt="">
        <img class="w-full h-full bg-phone" src="~@/assets/christmas/tree-phone.gif" alt="">
        <div class="ball-box absolute top-0 left-0 right-0 bottom-0">
          <div class="relative w-full h-full">
            <div v-for="(item, index) of curations"
                 :key="index" class="ball"
                 @click="gotoDetail(item)"
                 :class="[item.status===0?'ball-silver':'', item.status===1?'ball-gold':'', item.status===2?'ball-light':'']">
              <div class="w-full h-full relative">
                <img :src="ballOptions[index]" alt="">
                <img v-if="item.icon" class="ball-logo" :src="item.icon" alt="">
              </div>
            </div>
          </div>
        </div>
        <!-- star -->
        <el-popover ref="starPopoverRef" :visible="starPopVisible"
                    placement="right" trigger="click" persistent popper-class="c-popper">
          <template #reference>
            <img class="star-img cursor-pointer"
                 :class="[blindBoxStatus===0?'star-silver':'', blindBoxStatus===1?'star-gold':'', blindBoxStatus===2?'star-light':'']"
                 @click="clickStar"
                 src="~@/assets/christmas/star.png" alt="">
          </template>
          <template #default>
            <div class="bg-white rounded-15px py-15px pl-12px pr-18px w-120px relative" style="color: #c63322">
              Coming soon
              <img class="absolute -right-8px -bottom-4px w-30px"
                   src="~@/assets/christmas/msg-tag.png" alt="">
              <span class="star-triangle"></span>
            </div>
          </template>
        </el-popover>
        <!-- Santa -->
        <el-popover ref="msgPopoverRef" persistent :visible="msgVisible"
                    trigger="click" placement="top-start" popper-class="c-popper">
          <template #reference>
            <button class="santa-pointer"
                    @click.stop="showChristmasMessage"></button>
          </template>
          <template #default>
            <div class="bg-white rounded-15px py-5px pl-12px pr-18px min-w-200px relative" style="color: #c63322">
              {{messages[showingMessageIndex]}}
              <img class="absolute -right-8px -bottom-4px w-30px"
                   src="~@/assets/christmas/msg-tag.png" alt="">
              <span class="triangle"></span>
            </div>
          </template>
        </el-popover>

        <!-- view more -->
        <button class="view-more" @click="moreVisible=true"></button>
        <!-- twitter -->
        <button @click="gotoTwitter" class="twitter-pointer">
          <img src="~@/assets/christmas/twitter.png" alt="">
        </button>
      </div>
      <div class="snowflake" v-for="i of 80" :key="i"></div>
    </div>
    <!-- ball -->
    <el-dialog class="c-img-dialog"
               v-model="modalVisible" :fullscreen="true" title="&nbsp;" @click="modalVisible=false">
      <div class="w-full h-full flex flex-col justify-center items-center">
        <div v-if="showBoxAnimation"
             class="flex-1 flex flex-col justify-center items-center relative w-max" @click.stop>
          <svg xmlns="http://www.w3.org/2000/svg" class="gift-box" viewBox="-180 -200 800 800">
            <path d="M425.435 273.698v193.301c0 24.899-20.099 45-45 45h-150v-271h131.4c1.8 0 3.6.3 5.099.899l48.6 17.701c6 2.1 9.901 7.8 9.901 14.099z" fill="#c60034"></path>
            <path d="M415.534 259.599l-48.6-17.701c-1.5-.599-3.3-.899-5.099-.899h-311.4c-8.401 0-15 6.599-15 15v211c0 24.899 20.099 45 45 45h300c24.901 0 45-20.101 45-45V273.698c0-6.299-3.901-11.999-9.901-14.099z" fill="#fc1a40"></path>
            <path d="M185.435 240.999v271h90v-271h-90z" fill="#fcbf29"></path>
            <g class="gift-box-top">
              <path d="M420.035 97.788c-5.099-20.7-20.4-36.899-41.1-43.5-20.4-6.301-42.301-1.8-58.2 12.599l-34.801 30.601-6.899-45.899c-3.3-21-16.8-38.701-36.899-47.1-3.9-1.501-7.8-2.701-11.7-3.301-16.5-3.3-33.6.3-47.401 10.501-18.3 13.2-27.599 35.4-24.6 57.599 3.301 22.2 18.301 41.1 39.6 48.6l32.401 11.7 39.9 14.7h.3l69.3 25.499c6.899 2.401 14.099 3.602 20.999 3.602 14.702 0 29.101-5.402 40.501-15.601 16.799-15 23.999-38.101 18.599-60z" fill="#fe9923"></path>
              <path d="M401.435 157.788c-11.4 10.199-25.8 15.601-40.501 15.601-6.899 0-14.099-1.201-20.999-3.602l-69.3-25.499h-.3l-39.9-14.7V1.187c3.9.601 7.8 1.8 11.7 3.301 20.099 8.399 33.6 26.1 36.899 47.1l6.899 45.899 34.801-30.601c15.899-14.399 37.8-18.9 58.2-12.599 20.7 6.601 36 22.8 41.1 43.5 5.401 21.9-1.799 45.001-18.599 60.001z" fill="#fe8821"></path>
              <path d="M476.735 234.098l-20.4 56.4c-2.401 6-8.101 9.6-14.101 9.6-1.8 0-3.6-.3-5.099-.899l-155.101-56.4-14.099-46.5-37.5 8.399-32.999 7.5-155.101-56.4c-7.8-2.999-11.699-11.7-9-19.2l20.7-56.398c3.9-11.4 12.301-20.402 23.101-25.501s23.099-5.7 34.499-1.5l118.801 43.2 8.101 2.999s32.399 58.801 33.3 58.801c.601 0 13.5-7.2 26.1-14.101 12.597-6.9 25.198-14.099 25.198-14.099l126.599 46.199c11.4 4.2 20.4 12.601 25.499 23.401 5.102 10.799 5.701 23.1 1.502 34.499z" fill="#ff3e75"></path>
              <path d="M476.735 234.098l-20.4 56.4c-2.401 6-8.101 9.6-14.101 9.6-1.8 0-3.6-.3-5.099-.899l-155.101-56.4-14.099-46.5-37.5 8.399V96.399l8.101 2.999s32.399 58.801 33.3 58.801c.601 0 13.5-7.2 26.1-14.101 12.598-6.9 25.199-14.099 25.199-14.099l126.599 46.199c11.4 4.2 20.4 12.601 25.499 23.401 5.102 10.799 5.701 23.1 1.502 34.499z" fill="#fc1a40"></path>
              <path d="M238.535 99.398l-8.101 22.2-32.999 90.601 32.999 12.001 37.5 13.5 14.099 5.099 41.102-112.8-84.6-30.601z" fill="#fcbf29"></path>
              <path fill="#fe9923" d="M323.135 129.999l-41.101 112.8-14.099-5.1-37.5-13.5V121.598l8.1-22.2z"></path>
            </g>
            <path fill="#fe9923" d="M230.439 240.999h45v271h-45z"></path>
          </svg>
          <div class="gift min-w-100px ">
            <div class="relative">
              <img src="~@/assets/christmas/gift-banner.png" alt="">
              <span class="gift-text text-white whitespace-nowrap c-text-black text-34px xl:text-2.5rem">{{blindAmount}}U</span>
            </div>
          </div>
        </div>
        <div v-else class="relative">
          <img class="max-w-300px" src="~@/assets/christmas/gift-banner.png" alt="">
          <span class="gift-text text-white whitespace-nowrap c-text-black text-34px xl:text-2.5rem">{{blindAmount}}U</span>
        </div>
      </div>
    </el-dialog>
    <!-- guild line -->
    <el-dialog v-model="moreVisible"
               class="c-dialog c-dialog-center c-dialog-no-bg c-dialog-no-shadow max-w-34rem">
      <div class="relative max-w-600px mx-auto">
        <img class="w-full h-full" src="~@/assets/christmas/modal-bg.png" alt="">
        <button class="absolute top-12/100 right-14/100 w-5/100 cursor-pointer" @click="moreVisible=false">
          <img src="~@/assets/christmas/close.png" alt="">
        </button>
        <div class="absolute modal-content-box overflow-auto text-white no-scroll-bar">
          <div class="c-text-black text-20px xl:text-1.2rem mb-8px">Campaign Guidline</div>
          <div class=" text-left break-word">
            <div class="text-12px leading-20px xl:text-0.6rem xl:leading-1rem ">
              Christmas is coming, Wormhole3 has partnered with different projects to
              deliver prizes to everyone as Santa! All the prizes are packaged on this
              special Christmas tree, try clicking on these golden balls and discover these surprises.</div>
            <div class="c-text-black text-18px leading-28px xl:text-1rem xl:leading-1.6rem my-12px">
              Campaign period: 12.15-12.27
            </div>
            <div class="c-text-black text-16px leading-26px xl:text-0.9rem xl:leading-1.4rem my-12px">
              How to participate:
            </div>
            <div class="c-text-black text-14px leading-24px xl:text-0.8rem xl:leading-1.3rem my-10px">
              12.15 -12.24
            </div>
            <div class="text-12px leading-20px xl:text-0.7rem xl:leading-1.2rem ">
              All the projects will be putting a certain amount of Token prizes into the corresponding golden balls. Just click on the balls to enter the curation participation page and complete the tasks, so you can light up each ball and win the rewards.
            </div>
            <div class="c-text-black text-14px leading-24px xl:text-0.8rem xl:leading-1.3rem my-10px">
              12.25
            </div>
            <div class="text-12px leading-20px xl:text-0.7rem xl:leading-1.2rem ">
              Wormhole3 will initiate a curation task on Christmas day. Once you participate in a curation, the corresponding golden ball will be lit, you can light up all 10 golden balls in the end. When all the golden balls are lit, the star at the top of the Christmas tree will light up and you will be eligible to participate in the mystery box drawing.
            </div>
            <div class="c-text-black text-14px leading-24px xl:text-0.8rem xl:leading-1.3rem my-10px">
              12.26-12.27
            </div>
            <div class="text-12px leading-20px xl:text-0.7rem xl:leading-1.2rem ">
              After you successfully participate in all the curation and light up all the golden balls and stars on the top of the Christmas tree, you will be eligible to click on the top star on 12.26 to draw your USDT mystery box （contains rewards <span class="c-text-black text-colorFF text-15px xl:text-0.8rem "> max 25U</span>, and every user who lights up the Star has a chance to draw, one person per chance）& get Limited Christmas NFT
            </div>
            <div class="c-text-black text-16px leading-26px xl:text-0.9rem xl:leading-1.4rem mt-30px mb-10px">
              How to successfully participate in a curation:
            </div>
            <div class="text-12px leading-20px xl:text-0.7rem xl:leading-1.2rem">
              Click on each golden ball representing each project and follow the curation task on the curation page.
            </div>
            <div class="text-12px leading-20px xl:text-0.7rem xl:leading-1.2rem mt-20px mb-10px">
              NOTE
            </div>
            <div class="text-12px leading-20px xl:text-0.7rem xl:leading-1.2rem  italic">
              Please <span class="c-text-black text-15px xl:text-0.8rem">DO NOT</span> delete any of your curation quoted/replied tweet or your lit golden ball will go off and you won’t be qualified to participate in the mystery box drawing
              <br><br>
              Every curation will end on 12.24, even if you missed the previous curation, you can still participate before them close
            </div>
            <div class="c-text-black text-16px leading-26px xl:text-0.9rem xl:leading-1.4rem mt-30px mb-10px">
              Rewards
            </div>
            <ul>
              <li>Curating rewards equivalent to more than 500USDT</li>
              <li>500 USDT mystery box</li>
              <li>Limited Christmas NFT</li>
            </ul>
            <div class="font-bold text-12px leading-20px xl:text-0.7rem xl:leading-1.2rem mt-20px mb-10px">
              This campaign is powered by Wormhole3, follow @wormhole_3 so you don’t miss out on anything!
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import goldBall1 from '@/assets/christmas/ball1-gold.png'
import goldBall2 from '@/assets/christmas/ball2-gold.png'
import goldBall3 from '@/assets/christmas/ball3-gold.png'
import goldBall4 from '@/assets/christmas/ball4-gold.png'
import goldBall5 from '@/assets/christmas/ball5-gold.png'
import goldBall6 from '@/assets/christmas/ball6-gold.png'
import goldBall7 from '@/assets/christmas/ball7-gold.png'
import goldBall8 from '@/assets/christmas/ball8-gold.png'
import goldBall9 from '@/assets/christmas/ball9-gold.png'
import goldBall10 from '@/assets/christmas/ball10-gold.png'
import { getChristmasCurations, openBlindBox } from '@/api/api'
import { mapGetters } from 'vuex'
import {unref} from "vue";

export default {
  name: "ChristmasEvent",
  data() {
    return {
      ballOptions: [goldBall1, goldBall2, goldBall3, goldBall4, goldBall5, goldBall6, goldBall7, goldBall8, goldBall9, goldBall10],
      status: [1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
      audio: null,
      isPaused: true,
      modalVisible: false,
      showInfo: false,
      starStatus: 0,
      interval: null,
      curations: [],
      claimed: false,
      moreVisible: false,
      blindAmount: 0,
      showBoxAnimation: false,
      messages: [
        'I am the Christmas sugar and spice for girls and boys that are nice.',
        'I work my jolliness right into your heart.',
        'Sadly, I only come in town once a year.',
        `Smile! Santa's coming to town.`,
        `I exist within the hearts of children and adults alike.`,
        `I symbolize the love we give one another and the importance of happiness.`,
        `Wishing you peace and joy all season long. Happy Holidays!`,
        `Cheers to warm holiday memories!`,
        `You know you're getting old when Santa starts looking younger.`,
        `Gifts of time and love are surely the basic ingredients of a truly merry Christmas.`,
        `Sending lots of peace and joy to you and your family this Christmas season.`,
        `HO HO HO`,
        `HO HO HO`,
        `HO HO HO`,
        `HO HO HO`,
        `HO HO HO`,
        `My favorite snack is milk and cookies, what about you?`,
        `I hope your Christmas is filled with laughter and prosperity.`,
        `Merry Christmas! This coming year, may you be gifted with countless blessings`,
        `Oh, Christmas isn’t just a day; it’s a frame of mind.`,
        `To cherish peace and goodwill, to be plenteous in mercy, is to have the real spirit of Christmas`,
        `You better watch out, you better not cry, better not pout, I'm telling you why— I am coming to town.`,
        `The elves are very busy and still working.`,
        `May you never be too grown up to search the skies on Christmas Eve.`,
        `Sending you love, strength and unwavering support this holiday season.`,
        `Hey you, have you been a good kid this year?`,
        `Hey you, have you been a good kid this year?`,
        `The reindeers love carrots and apples, they are my good helper`,
        `My favorite snack is milk and cookies, what about you?`,
        `Cheers to warm holiday memories!`,
        `Cheers to warm holiday memories!`,
        `Christmas, kid, is love in action. Every time we love, every time we give, it's Christmas`,
        `Have a jolly holiday.`,
        `May your heart be filled with all the joys of the season`,
        `Merry Christmas with lots of love!`,
        `It’s the most wonderful time of the year!`,
        `Fuzzy socks and candy cane pops, everyone knows that Christmas rocks.`,
        `Keeping you in our hearts this holiday season, and always!`,
        `Are you dreaming of a white Christmas ~`,
        `Rudolph, Have you seen Rudolph?`,
        `A Christmas Reminder for you: Don’t try to borrow any money from elves; They’re always a little short!`,
        `Wishing you a white Christmas this year. If you run out of white, I have plenty of red.`,
        `Remember, Santa is watching. Everything. Yes, even that. Anyway, Merry Christmas!`,
        `This holiday season, let’s make it a point to cherish what’s truly important in our lives: cookies.`,
        `Eat. Drink. Be Merry. Have a wonderful Christmas!`,
        `Wishing you a season full of light and laughter for you`,
        `May your holidays sparkle with joy and laughter`,
        `Wishing you a fun-filled holiday season and best wishes for a Happy New Year!`
      ],
      showingMessageIndex: 0,
      msgPopoverRef: null,
      msgVisible: false,
      lastClickTime: 0,
      timeCount: 0,
      starPopVisible: false,
      starClickTime: 0
    }
  },
  computed: {
    ...mapGetters(['getAccountInfo']),
    blindBoxStatus() {
      if (this.claimed) {
        return 2
      }
      let count = 0
      for(let curation of this.curations) {
        if (curation && curation.curationId) {
          count += (curation.tasks === curation.taskRecord)
        }else {
          return 0
        }
        if (count === 10) {
          return 1
        }
      }
    }
  },
  mounted() {
    this.setBg()
    window.onresize = () => {
      this.setBg()
    }
    this.audio = new Audio('./JingleBells.mp3');
    this.audio.play()
    this.isPaused = this.audio.paused
    this.audio.loop = true
    if (this.getAccountInfo?.twitterId) {
      openBlindBox(this.getAccountInfo.twitterId, false).then(res => {
        if (res?.reward) {
          this.claimed = res.claimStatus === 1;
          this.blindAmount = res.reward;
        }
      }).catch()
    }
    this.udpateCurations()
    this.interval = setInterval(() => {
      this.timeCount += 1
      if(this.timeCount === 3) {
        this.udpateCurations()
        this.timeCount = 0
      }
      if(this.msgVisible && new Date().getTime() - this.lastClickTime>2000)  {
        this.msgVisible = false
      }
      if(this.starPopVisible && new Date().getTime() - this.starClickTime>2000)  {
        this.starPopVisible = false
      }
    }, 2000);
  },
  beforeUnmount() {
    this.audio.pause()
    clearInterval(this.interval)
  },
  methods: {
    setBg() {
      if((this.$refs.christmasRef.offsetWidth/this.$refs.christmasRef.offsetHeight)<1.2) {
        document.getElementById('tree-box').className = 'tree-box tree-box-phone'
        document.getElementsByClassName('bg-web')[0].style.display='none'
        document.getElementsByClassName('bg-phone')[0].style.display='block'
      } else {
        document.getElementById('tree-box').className = 'tree-box tree-box-web'
        document.getElementsByClassName('bg-web')[0].style.display='block'
        document.getElementsByClassName('bg-phone')[0].style.display='none'
      }
    },
    onPlay() {
      this.isPaused = this.audio.paused
      this.isPaused?this.audio.play():this.audio.pause()
    },
    gotoDetail(curation) {
      if (curation.curationId) {
        this.$router.push('/curation-detail/' + curation.curationId)
      }
    },
    gotoTwitter() {
      window.open('https://twitter.com/wormhole_3')
    },
    clickStar() {
      if (this.blindBoxStatus === 0) return
      let needClaim = false
      this.showBoxAnimation = false;
      if (!this.claimed) {
        this.showBoxAnimation = true;
        needClaim = true
      }
      this.modalVisible = true
      openBlindBox(this.getAccountInfo?.twitterId, needClaim).then(res => {
        if (res?.reward) {
          this.claimed = res.claimStatus === 1;
          this.blindAmount = res.reward;
        }
      }).catch()
    },
    showChristmasMessage() {
      if (this.msgVisible === true) return;
      this.msgVisible = true
      this.lastClickTime = new Date().getTime()
      const total = this.messages.length
      this.showingMessageIndex = Math.floor(Math.random() * total)
      console.log(this.showingMessageIndex);
    },
    async udpateCurations() {
      try {
        const res = await getChristmasCurations(this.getAccountInfo?.twitterId);
        let curations = [];
        if (res && res.length > 0) {
          for (let i = 0; i < 10; i++) {
            const curation = res.find(c => c.index === i)
            if (curation) {
              let status = 0;
              if (curation.taskStatus === 0) {
                if (curation.tasks === curation.taskRecord) {
                  status = 2;
                }else {
                  status = 1;
                }
              }else {
                if (curation.tasks && (curation.tasks === curation.taskRecord)) {
                  status = 2;
                }else {
                  status = 0;
                }
              }
              if (!curation.curationId) {
                status = 0;
              }
              curations.push({
                ...curation,
                status
              })
            }else {
              curations.push({
                status: 0,
                icon: null
              })
            }
          }
          this.curations = curations;
        }
      }catch(e) {
        console.log(35, e);
      }
    }
  }
}
</script>

<style scoped lang="scss">
.christmas-page {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
  background-color: #c63322;
  z-index: 0;
  .bg-light {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .tree-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .music-icon {
    transform: rotate(0deg);
    animation: rotate-icon 3s linear infinite;
  }
}
@keyframes rotate-icon {

  100% {
    transform: rotate(360deg);
  }
}
.star-img {
  position: absolute;
  &.star-light {
    filter: drop-shadow(0 0 20px #ffb800);
    animation-name: star;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }
  &.star-gold {
    animation-name: starGold;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }
  &.star-silver {
    filter: grayscale(1);
  }
}
.twitter-pointer {
  animation: move 1s infinite;
}
@keyframes move {
  0% {
    transform: translateY(-3px);
  }
  50% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(-3px);
  }
}
.ball {
  &.ball-light{
    animation-name: light-ball;
    animation-duration: 0.6s;
    animation-iteration-count: infinite;
    cursor: pointer;
    &:hover{
      transform: scale(0.95);
      cursor: pointer;
    }
  }
  &.ball-gold {
    animation-name: gold-ball;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    cursor: pointer;
    &:hover{
      transform: scale(0.95);
      cursor: pointer;
    }
  }
  &.ball-silver {
    filter: grayscale(1);
  }
  .ball-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 75%;
    transform: translate(-50%, -50%);
  }
}
.tree-box-web {
  height: 90vh;
  width: 133.3vh;
  .view-more {
    position: absolute;
    width: 10%;
    height: 10%;
    left: 76%;
    top: 68%;
  }
  .twitter-pointer {
    position: absolute;
    width: 11%;
    height: 9%;
    left: 6.5%;
    top: 60.9%;
  }
  .santa-pointer {
    position: absolute;
    width: 8%;
    height: 20%;
    left: 22%;
    top: 54%;
  }
  .star-img {
    top: 8.5%;
    left: 48.9%;
    transform: translateX(-50%);
    width: 9%;
  }
  .ball {
    position: absolute;
    width: 4.8%;
    &:nth-child(1) {
      top:68.7%;
      left: 38.4%;
    }
    &:nth-child(2) {
      top:67.3%;
      left: 43.5%;
    }
    &:nth-child(3) {
      top:66.2%;
      left: 48.7%;
    }
    &:nth-child(4) {
      top:64.6%;
      left: 53.6%;
    }
    &:nth-child(5) {
      top:61%;
      left: 58.2%;
    }
    &:nth-child(6) {
      top:53.2%;
      left: 39.4%;
    }
    &:nth-child(7) {
      top:53.5%;
      left: 44.7%;
    }
    &:nth-child(8) {
      top:52.3%;
      left: 50.1%;
    }
    &:nth-child(9) {
      top:49.3%;
      left: 54.5%;
    }
    &:nth-child(10) {
      top:42.3%;
      left: 43.9%;
    }
  }
}
.tree-box-phone {
  width: 45vh;
  height: 80vh;
  .view-more {
    position: absolute;
    width: 20%;
    height: 6%;
    left: 70%;
    top: 79%;
  }
  .twitter-pointer {
    position: absolute;
    width: 20%;
    height: 9%;
    left: 11.4%;
    top: 76.8%;
  }
  .santa-pointer {
    position: absolute;
    width: 15%;
    height: 16%;
    left: 4.5%;
    top: 61%;
  }
  .star-img {
    position: absolute;
    top: 8.2%;
    left: 50%;
    transform: translateX(-50%);
    width: 21.8%;
  }
  .star-img-shadow {
    position: absolute;
    top: 8.2%;
    left: 50%;
    transform: translateX(-50%);
    width: 21.8%;
    height: 10%;
  }
  .ball {
    position: absolute;
    width: 12.7%;

    &:nth-child(1) {
      top: 67.4%;
      left: 22.13%;
    }
    &:nth-child(2) {
      top: 66%;
      left: 35.5%;
    }
    &:nth-child(3) {
      top:64.9%;
      left: 48.9%;
    }
    &:nth-child(4) {
      top:63.2%;
      left: 62.16%;
    }
    &:nth-child(5) {
      top:59.5%;
      left: 75%;
    }
    &:nth-child(6) {
      top: 51.6%;
      left: 24.6%;
    }
    &:nth-child(7) {
      top: 52%;
      left: 39%;
    }
    &:nth-child(8) {
      top: 50.8%;
      left: 53.3%;
    }
    &:nth-child(9) {
      top: 48%;
      left: 65%;
    }
    &:nth-child(10) {
      top: 40.5%;
      left: 39%;
    }
  }
}

.snowflake {
  --size: 1vw;
  width: var(--size);
  height: var(--size);
  background: white;
  border-radius: 50%;
  position: absolute;
  top: -5vh;
  box-shadow: 0 0 4px 2px #FFFFFF;
}
.snowflake:nth-child(3n) {
  filter: blur(2px);
}

@keyframes snowfall {
  0% {
    transform: translate3d(var(--left-ini), 0, 0);
  }
  100% {
    transform: translate3d(var(--left-end), 110vh, 0);
  }
}

@for $i from 1 through 60 {
  .snowflake:nth-child(#{$i}) {
    --size: #{random(2) * 0.2}vw;
    --left-ini: #{random(20) - 10}vw;
    --left-end: #{random(20) - 10}vw;
    left: #{random(100)}vw;
    animation: snowfall #{5 + random(10)}s linear infinite;
    animation-delay: -#{random(10)}s;
  }
}

@for $i from 60 through 80 {
  .snowflake:nth-child(#{$i}) {
    --size: #{random(7) * 0.2}vw;
    --left-ini: #{random(20) - 10}vw;
    --left-end: #{random(20) - 10}vw;
    left: #{random(100)}vw;
    animation: snowfall #{5 + random(10)}s linear infinite;
    animation-delay: -#{random(10)}s;
  }
}

@keyframes snowfall {
  0% {
    transform: translate3d(var(--left-ini), 0, 0);
  }
  100% {
    transform: translate3d(var(--left-end), 110vh, 0);
  }
}
@keyframes star {
  50% {
    filter: drop-shadow(0 0 0 #ffb800);
  }
}

@keyframes light-ball {
  50% {
    filter: sepia(0.8);
  }
}

@keyframes gold-ball {
  50% {
    transform: scale(0.9);
  }
}

.gift-box {
  width: 20rem;
  height: 30rem;
  z-index: 2;
  animation: showBox 1s ease-in forwards, hideBox 1s 3s ease-in-out forwards;
}
.gift-box-top {
  transform: rotate(-20deg) translate(-115px, 105px);
  animation: openBoxTop 2s ease-in-out forwards;
  animation-delay: 1s;
}

.gift {
  position: absolute;
  z-index: 1;
  transform: scale(0) translateY(0);
  animation: moveGift 1s ease-in-out forwards, showGift 1.5s 3s ease-in-out forwards;
  animation-delay: 3s;
}
.gift-text {
  position: absolute;
  top: 31%;
  left: 58%;
  transform: translate(-50%, -50%);
}

@keyframes showBox {
  0% {
    transform:  scale(0.1);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes hideBox {
  0% {
    transform:  scale(1) translateY(0);
  }
  100% {
    transform: scale(0.6) translateY(50%);
  }
}
@keyframes openBoxTop {
  0% {
    transform: rotate(-20deg) translate(-115px, 105px);
  }
  100% {
    transform: rotate(85deg) translate(-145px, -630px);
  }
}
@keyframes moveGift {
  0% {
    transform: scale(0.2) translateY(20%);
  }
  100% {
    transform: scale(0.2) translateY(-20%);
  }
}
@keyframes showGift {
  0% {
    transform: scale(0.2) translateY(20%);
  }
  100% {
    transform: scale(0.5) translateY(-20%);
  }
}
.modal-content-box {
  top: 24%;
  left: 12%;
  right: 15%;
  bottom: 8%;
}
ul {
  display: block;
  list-style-type: disc;
  margin-inline-start: 0;
  margin-inline-end: 0;
  padding-inline-start: 20px;
}
.triangle {
  position: absolute;
  bottom: -16px;
  left: 15%;
  width: 14px;
  height: 16px;
  background: white;
  clip-path: polygon(0 0, 100% 0, 50% 100%, 0 0);
}
.star-triangle {
  position: absolute;
  top: 30%;
  left: -16px;
  width: 16px;
  height: 14px;
  background: white;
  clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 50%);
}
</style>
