<template>
  <div id="user-index"
       class="overflow-x-hidden h-full flex flex-col no-scroll-bar"
       @scroll="pageScroll"
       ref="userIndexRef">
    <button v-show="scroll>100"
            @click="$refs.userIndexRef.scrollTo({top: 0, behavior: 'smooth'})"
            class="flex items-center justify-center bg-color62
                   h-44px w-44px min-w-44px 2xl:w-2.2rem 2xl:min-w-2.2rem 2xl:h-2.2rem
                   rounded-full mt-0.5rem c-text-bold fixed bottom-8rem right-1.5rem sm:right-2.5rem z-9999">
      <img class="w-20px min-w-20px h-20px 2xl:w-1rem 2xl:h-1rem" src="~@/assets/icon-arrow-top.svg" alt="">
    </button>
    <template v-if="!loading">
      <div class="border-b-1 border-color84/30">
        <div class="container max-w-50rem mx-auto">
          <div class="px-1rem mt-1rem flex items-center">
            <img
                class="w-6rem h-6rem md:w-4.8rem md:h-4.8rem mr-1.5rem rounded-full gradient-border border-1px"
                @error="replaceEmptyImg"
                :src="profileImg"
                alt=""/>
            <div class="flex-1 overflow-hidden">
              <div class="flex items-center overflow-hidden w-full mb-5px">
                <div class="c-text-black text-16px xl:text-1rem light:text-blueDark mr-5px text-left">
                  {{ getAccountInfo ? getAccountInfo.twitterName : "" }}
                </div>
                <div class="flex items-center justify-start text-color7D/60"
                     v-if="getAccountInfo && getAccountInfo.steemId">
                  <span class="hover" @click="gotoSteem">#{{ getAccountInfo ? getAccountInfo.steemId : "" }}</span>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-y-4px">
                <div @click="gotoTwitter"
                     class="cursor-pointer mr-0.5rem w-max flex items-center
                            text-color8B light:text-color7D
                            bg-white/10 light:bg-colorF2
                            light:border-1 light:border-colorE3
                            rounded-full min-h-24px h-1.4rem md:1rem px-0.5rem">
                  <img class="w-16px 2xl:w-1.2rem md:w-1rem mr-0.3rem" src="~@/assets/icon-twitter-blue.svg" alt="">
                  <span class="text-12px 2xl:text-0.7rem">@{{getAccountInfo ? getAccountInfo.twitterUsername : " "}}</span>
                </div>
                <div v-if="getAccountInfo?.reputation > 0" class="cursor-pointer mr-0.5rem w-max whitespace-nowrap
                                text-color8B light:text-color7D flex items-center
                                bg-white/10 light:bg-colorF2 text-12px 2xl:text-0.7rem
                                light:border-1 light:border-colorE3
                                rounded-full min-h-24px h-1.4rem md:1rem px-0.5rem"
                                @click="modalVisible=true">
                  Twitter Reputation:{{getAccountInfo ? getAccountInfo.reputation : 0}}
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blockBg sm:bg-transparent overflow-hidden
                      light:bg-white light:sm:bg-transparent pt-7px mt-30px">
            <div class="flex overflow-hidden text-16px xl:text-0.9rem font-bold md:max-w-30rem mx-auto">
              <router-link v-if="getAccountInfo && (getAccountInfo.isRegistry === 1 || getAccountInfo.source === 3)"
                           :to="`/profile/${$route.params.user}/curations`" v-slot="{isActive}"
                           class="flex-1 cursor-pointer">
                <div class="w-full h-40px xl:h-2.4rem flex items-center justify-center border-b-2 md:border-b-4"
                     :class="isActive?'text-color62 border-color62':'text-color7D border-transparent'">
                  {{$t('profileView.curations')}}
                </div>
              </router-link>
              <router-link :to="`/profile/${$route.params.user}/post`" v-slot="{isActive}"
                           class="flex-1 cursor-pointer">
                <div class="w-full h-40px xl:h-2.4rem flex items-center justify-center border-b-2 md:border-b-4"
                     :class="isActive?'text-color62 border-color62':'text-color7D border-transparent'">
                  {{$t('profileView.onChainTweet')}}
                </div>
              </router-link>
            </div>
          </div>
        </div>
        <div class="w-full absolute bottom-0">
          <div class="container max-w-50rem mx-auto relative">
            <template v-if="getAccountInfo && (getAccountInfo.source === 1)">
              <button v-if="getAccountInfo.isRegistry === 1 && $route.name === 'profile-curations'"
                      class="flex items-center justify-center bg-color62
                                 h-44px w-44px min-w-44px 2xl:w-2.2rem 2xl:min-w-2.2rem 2xl:h-2.2rem
                                 rounded-full mt-0.5rem c-text-bold absolute bottom-2rem right-1.5rem sm:right-2.5rem z-2"
                      @click="$router.push('/create-curation')">
                <img class="w-20px min-w-20px h-20px 2xl:w-1rem 2xl:h-1rem" src="~@/assets/icon-add-white.svg" alt="">
              </button>
              <button v-else
                      class="flex items-center justify-center bg-color62
                                 h-44px w-44px min-w-44px 2xl:w-2.2rem 2xl:min-w-2.2rem 2xl:h-2.2rem
                                 rounded-full mt-0.5rem c-text-bold absolute bottom-2rem right-1.5rem sm:right-2.5rem z-2"
                      @click="tipDrawer = true">
                <img class="w-20px min-w-20px h-20px 2xl:w-1rem 2xl:h-1rem" src="~@/assets/icon-add-white.svg" alt="">
              </button>
            </template>
            <button v-else class="flex items-center justify-center bg-color62 h-2.7rem px-1rem
                    rounded-full mt-0.5rem c-text-bold absolute bottom-2rem left-1/2 transform-translate-x-1/2 z-2"
                    @click="$store.commit('saveShowLogin', true)">
              {{$t('common.active')}}
            </button>
          </div>
        </div>
      </div>
      <div class="bg-blockBg light:bg-white light:sm:bg-transparent sm:bg-transparent container max-w-50rem mx-auto flex-1 pb-2rem sm:px-1rem">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" v-if="$route.meta.keepAlive" :key="$route.name"/>
          </keep-alive>
          <component :is="Component" v-if="!$route.meta.keepAlive" :key="$route.name"/>
        </router-view>
      </div>
    </template>
    <div class="c-text-black text-1.8rem mb-3rem" v-else>
      <img class="w-5rem mx-auto py-3rem" src="~@/assets/profile-loading.gif" alt="" />
    </div>
    <van-popup class="c-tip-drawer 2xl:w-2/5" v-model:show="tipDrawer" :position="position">
      <div class="modal-bg relative w-full md:min-w-560px max-h-80vh 2xl:max-h-28rem overflow-auto flex flex-col
                  rounded-t-1.5rem md:rounded-b-1.5rem pt-1rem md:p-1rem">
        <button class="absolute right-20px top-2rem"
                @click="tipDrawer=false">
          <i class="w-18px h-18px 2xl:w-1rem 2xl:h-1rem icon-close"></i>
        </button>
        <div class="flex-1 overflow-auto px-1.5rem no-scroll-bar pb-2rem text-left">
          <div class="c-text-black mt-1rem mb-2rem text-20px 2xl:text-1rem md:text-center w-full">
            {{$t('postView.tweetTip')}}
          </div>
          <!-- tip post -->
          <div class="text-15px leading-24px 2xl:text-0.9rem 2xl:leading-1.2rem c-text-black mt-1rem light:text-color46">
            {{$t('postView.tip1')}}
          </div>
          <div class="bg-black/40 light:bg-colorF2 light:border-1 light:border-colorE3 rounded-1rem h-min-8rem p-1rem relative">
            <div class="text-left break-all 2xl:text-0.8rem text-14px">
              <span class="text-color8F">{content} </span>
              <span class="text-color62">#iweb3</span>
            </div>
            <button
              @click="gotoPost" class="text-color8B flex items-center justify-center border-1px border-color8B rounded-full
                2xl:h-2.2rem text-12px 2xl:text-0.9rem h-28px px-1rem absolute bottom-1rem right-1rem">
              <img
                class="w-1rem h-1rem mr-0.4rem"
                src="~@/assets/icon-twitter.svg"
                alt=""/>
              <span class="text-color8F">{{$t('postView.goTweet')}}</span>
            </button>
          </div>
          <div class="text-white light:text-color7D text-12px 2xl:text-0.8rem 2x:leading-1rem mt-0.5rem italic text-left">
            {{$t('postView.tips')}}:<br />{{$t('postView.p2')}}
          </div>
          <!-- tip tip -->
          <div class="text-15px leading-24px 2xl:text-0.9rem 2xl:leading-1.2rem c-text-black mt-1rem">
            {{$t('postView.tip2')}}
          </div>
          <div class="bg-black/40 light:bg-colorF2 light:border-1 light:border-colorE3 rounded-1rem h-min-8rem p-1rem relative">
            <div class="text-left break-all 2xl:text-0.8rem text-14px">
              <span class="text-color62 light:text-color62">@wormhole_3 !tip </span>
              <span class="text-color8F">{0.5 STEEM} to {@vitalik}</span>
            </div>
            <button
              @click="gotoTip"
              class="text-color8B flex items-center justify-center border-1px border-color8B rounded-full
                2xl:h-2.2rem text-12px 2xl:text-0.9rem h-28px px-1rem absolute bottom-1rem right-1rem">
              <img
                class="w-1rem h-1rem mr-0.4rem"
                src="~@/assets/icon-twitter.svg"
                alt=""/>
              <span class="text-color8F">{{$t('postView.goTweet')}}</span>
            </button>
          </div>
          <div class="text-white light:text-color7D text-12px 2xl:text-0.8rem 2x:leading-1rem mt-0.5rem italic text-left">
            {{$t('postView.tips')}}: <br />
            {{$t('postView.p9')}}
          </div>
          <!-- tip send -->
          <div class="text-15px leading-24px 2xl:text-0.9rem 2xl:leading-1.2rem c-text-black mt-1rem light:text-color46">
            {{$t('postView.tip3')}}
          </div>
          <div class="bg-black/40 light:bg-colorF2 light:border-1 light:border-colorE3 rounded-1rem h-min-8rem p-1rem relative">
            <div class="text-left break-all 2xl:text-0.8rem text-14px">
              <span class="text-color62 light:text-color62">@wormhole_3 !send </span>
              <span class="text-color8F">{0.5 STEEM} to {wormhole3}</span>
            </div>
            <button
              @click="gotoSend" class="text-color8B flex items-center justify-center border-1px border-color8B rounded-full
                2xl:h-2.2rem text-12px 2xl:text-0.9rem h-28px px-1rem absolute bottom-1rem right-1rem">
              <img
                class="w-1rem h-1rem mr-0.4rem"
                src="~@/assets/icon-twitter.svg"
                alt=""/>
              <span class="text-color8F">{{$t('postView.goTweet')}}</span>
            </button>
          </div>
          <div class="text-white light:text-color7D text-12px 2xl:text-0.8rem 2x:leading-1rem mt-0.5rem italic text-left">
            {{$t('postView.tips')}}:<br />
            {{$t('postView.p3')}}
          </div>
        </div>
      </div>
    </van-popup>
    <el-dialog
      v-model="showRegistering"
      class="c-dialog c-dialog-lg c-dialog-center"
    >
      <div class="text-white verify-view lg:p-3rem px-1rem py-2rem text-2rem">
        {{$t('postView.p4')}}<br />
        {{$t('postView.p5')}}<br />
        <div class="mx-auto">
          <img class="w-5rem mx-auto py-3rem" src="~@/assets/profile-loading.gif" alt="" />
        </div>
      </div>
    </el-dialog>
    <el-dialog
      v-model="showNotSendTwitter"
      class="c-dialog c-dialog-lg c-dialog-center"
    >
      <div class="text-white verify-view lg:p-3rem px-1rem py-2rem text-2rem">
        {{$t('postView.p6')}}
      </div>
    </el-dialog>
    <el-dialog v-model="modalVisible" class="c-dialog c-dialog-lg c-dialog-center c-dialog-no-bg c-dialog-no-shadow">
      <GetNft @close="modalVisible=false" :username="getAccountInfo.twitterUsername" :reputation="getAccountInfo.reputation"></GetNft>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { notify } from "@/utils/notify";
import GetNft from "./components/GetNft.vue";
import { formatPrice, formatAmount } from "@/utils/helper";
import emptyAvatar from "@/assets/icon-default-avatar.svg";
import { ethers } from "ethers";
import { getTokenBalance } from "@/utils/asset";
import { ERC20List, TWITTER_MONITOR_RULE, SteemScan, TWITTER_POST_TAG } from "@/config";
import { getSteemBalance } from "@/utils/steem";

export default {
  name: "User",
  components: {
    GetNft,
  },
  data() {
    return {
      userIsExist: true,
      loading: false,
      tipDrawer: false,
      showRegistering: false,
      showNotSendTwitter: false,
      modalVisible: false,
      position: document.body.clientWidth < 768 ? "bottom" : "center",
      scroll: 0
    };
  },
  computed: {
    ...mapState([
      "accountInfo",
      "prices",
      "ethBalance",
      "erc20Balances",
      "steemBalance",
    ]),
    ...mapGetters(["getAccountInfo"]),
    totalValue() {
      let t = 0;
      if (this.steemBalance) {
        // eth
        //  t += this.erc20Balances['ETH'].ETH * this.prices['eth']
        // for (let erc20 in this.erc20Balances["ETH"]) {
        //   t += this.erc20Balances.ETH[erc20] * this.prices[erc20.toLowerCase()];
        // }
        // steem
        t += this.steemBalance * this.prices["steem"];

        // bsc
        // for (let erc20 in this.erc20Balances["BNB"]) {
        //   t += this.erc20Balances.BNB[erc20] * this.prices[erc20.toLowerCase()];
        // }
        //  // polygon
      }
      if(this.getAccountInfo && this.erc20Balances["MATIC"]) {
        for (let erc20 in this.erc20Balances["MATIC"]) {
          t += this.erc20Balances.MATIC[erc20] * (this.prices[erc20.toLowerCase()] ?? 0);
        }
      }
      return formatPrice(t ?? 0);
      return "$0.00";
    },
    profileImg() {
      if (!this.getAccountInfo) return "";
      if (this.getAccountInfo.profileImg) {
        return this.getAccountInfo.profileImg.replace("normal", "400x400");
      } else {
        return (
          "https://profile-images.heywallet.com/" +
          this.getAccountInfo.twitterId
        );
      }
    },
  },
  methods: {
    pageScroll() {
      this.scroll = this.$refs.userIndexRef.scrollTop
    },
    showNotify(message, duration, type) {
      notify({ message, duration, type });
    },
    replaceEmptyImg(e) {
      e.target.src = emptyAvatar;
    },
    gotoTwitter() {
      window.open(
        "https://twitter.com/" + this.getAccountInfo.twitterUsername,
        "__blank"
      );
    },
    gotoSteem() {
      window.open(
        SteemScan + "@" + this.getAccountInfo.steemId,
        "__blank"
      );
    },
    gotoSend() {
      window.open(
        "https://twitter.com/intent/tweet?text=" +
          TWITTER_MONITOR_RULE +
          " !send  STEEM to ",
        "__blank"
      );
    },
    gotoTip(){
      window.open(
        "https://twitter.com/intent/tweet?text=" +
          TWITTER_MONITOR_RULE +
          " !tip  STEEM to ",
        "__blank"
      );
    },
    gotoPost() {
      window.open(
        "https://twitter.com/intent/tweet?text=" +
          TWITTER_POST_TAG,
        "__blank"
      );
    },
    copy(address) {
      if (ethers.utils.isAddress(address)) {
        navigator.clipboard.writeText(address).then(
          () => {
            this.showNotify("Copied address:" + address, 5000, "success");
          },
          (e) => {
            console.log(e);
          }
        );
      }
    },
  },
  async activated() {
    const twitterUsername = this.$route.params.user.startsWith("@")
      ? this.$route.params.user.substring(1)
      : this.$route.params.user;
    // getUserInfo
    if (
      this.getAccountInfo &&
      twitterUsername == this.getAccountInfo.twitterUsername
    ) {
      const { steemId, ethAddress, web25ETH, steemAmount } = this.getAccountInfo;
      if (steemId) {
        // get steem balance
        getSteemBalance(steemId)
          .then((balance) => {
            this.$store.commit("saveSteemBalance", balance.steemBalance);
            this.$store.commit("saveSbdBalance", balance.sbdBalance);
          })
          .catch((err) => console.log("get steem balance fail:", err));
      } else {
        this.$store.commit("saveSteemBalance", steemAmount ?? 0);
      }


      //get eth balances
      if (ethAddress) {
        getTokenBalance(ethAddress);
      }
    } else {
      this.$router.replace('/')
    }
  },
  async mounted() {
    const twitterUsername = this.$route.params.user.startsWith("@")
      ? this.$route.params.user.substring(1)
      : this.$route.params.user;
    // getUserInfo
    if (
      this.getAccountInfo &&
      twitterUsername == this.getAccountInfo.twitterUsername
    ) {
      const { steemId, ethAddress, web25ETH, steemAmount } = this.getAccountInfo;
      if (steemId) {
        // get steem balance
        getSteemBalance(steemId)
          .then((balance) => {
            this.$store.commit("saveSteemBalance", balance.steemBalance);
            this.$store.commit("saveSbdBalance", balance.sbdBalance);
          })
          .catch((err) => console.log("get steem balance fail:", err));
      } else {
        this.$store.commit("saveSteemBalance", steemAmount ?? 0);
      }

      //get eth balances
      if (ethAddress) {
        getTokenBalance(ethAddress);
      }
    } else {
      this.$router.replace('/')
    }
  },
};
</script>

<style scoped lang="scss">
</style>
