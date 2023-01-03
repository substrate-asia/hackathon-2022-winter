<template>
  <div class="h-full flex flex-col text-14px xl:text-0.8rem">
    <div id="user-index"
         class="overflow-x-hidden h-full flex flex-col no-scroll-bar"
         @scroll="pageScroll"
         ref="userIndexRef">
      <button v-show="scroll>100"
              @click="$refs.userIndexRef.scrollTo({top: 0, behavior: 'smooth'})"
              class="flex items-center justify-center bg-color62
                   h-44px w-44px min-w-44px 2xl:w-2.2rem 2xl:min-w-2.2rem 2xl:h-2.2rem
                   rounded-full mt-0.5rem c-text-bold fixed bottom-2rem right-1.5rem sm:right-2.5rem z-9999">
        <img class="w-20px min-w-20px h-20px 2xl:w-1rem 2xl:h-1rem" src="~@/assets/icon-arrow-top.svg" alt="">
      </button>
      <post-detail v-if="showDetail" :post="post" @hide="showDetail=false"/>
      <div v-show="!showDetail" class="h-full flex flex-col">
        <template v-if="!loading">
          <div class="border-b-1 border-color84/30">
            <div class="container max-w-50rem mx-auto">
              <div class="px-1rem mt-1rem flex items-start md:items-center overflow-hidden">
                <img
                    class="w-60px h-60px md:w-4.8rem md:h-4.8rem mr-1.5rem rounded-full gradient-border border-1px"
                    @error="replaceEmptyImg"
                    :src="profileImg"
                    alt=""/>
                <div class="flex-1 overflow-hidden">
                  <div class="flex items-center overflow-hidden w-full mb-5px">
                    <div class="c-text-black text-16px xl:text-1rem light:text-blueDark mr-5px text-left">
                      {{ accountInfo ? accountInfo.twitterName : "" }}
                    </div>
                    <div class="flex items-center justify-start text-color7D/60 mr-5px"
                         v-if="accountInfo && accountInfo.steemId">
                      <span class="hover" @click="gotoSteem">#{{ accountInfo ? accountInfo.steemId : "" }}</span>
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-y-4px">
                    <div @click="gotoTwitter"
                         class="cursor-pointer mr-0.5rem w-max flex items-center
                                  text-color8B light:text-color7D
                                  bg-white/10 light:bg-colorF2
                                  light:border-1 light:border-colorE3
                                  rounded-full min-h-24px h-1.4rem md:1rem px-0.5rem">
                      <img class="w-16px xl:w-1.5rem md:w-1rem mr-0.3rem" src="~@/assets/icon-twitter-blue.svg" alt="">
                      <span class="text-12px 2xl:text-0.7rem">@{{accountInfo ? accountInfo.twitterUsername : " "}}</span>
                    </div>
                    <div v-if="accountInfo?.reputation > 0" class="cursor-pointer mr-0.5rem w-max whitespace-nowrap
                                  text-color8B light:text-color7D flex items-center
                                  bg-white/10 light:bg-colorF2 text-12px 2xl:text-0.7rem
                                  light:border-1 light:border-colorE3
                                  rounded-full min-h-24px h-1.4rem md:1rem px-0.5rem">
                      Twitter Reputation:{{accountInfo ? accountInfo.reputation : 0}}
                    </div>
                  </div>
                  <div class="flex flex-wrap mt-5px overflow-hidden w-full">
                    <button class="h-24px flex items-center p-2px rounded-full mt-5px sm:mt-0 truncate
                                     border-1 border-color8B/30 light:border-color91/20 bg-white/10 light:bg-colorED"
                            @click="tip">
                      <img class="w-20px min-w-20px" src="~@/assets/icon-coin-tag.png" alt="">
                      <span v-if="accountInfo?.ethAddress" class="flex items-center truncate">
                        <span class="flex-1 whitespace-nowrap text-color7D truncate text-12px">
                          Address:{{accountInfo ? accountInfo.ethAddress : ''}}
                        </span>
                        <img class="w-16px min-w-16px light:opacity-30 ml-3px mr-8px"
                             @click.stop="copyAddress(accountInfo.ethAddress)"
                             src="~@/assets/icon-copy-primary.svg" alt="">
                      </span>
                      <span v-else class="whitespace-nowrap text-color7D truncate"> {{$t('tips.notRegisterUser')}}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="bg-blockBg sm:bg-transparent overflow-hidden
                          light:bg-white light:sm:bg-transparent pt-7px sm:pb-0 mt-30px">
                <div class="flex overflow-hidden text-16px xl:text-0.9rem font-bold md:max-w-30rem mx-auto">
                  <div class="flex-1 h-40px xl:h-2.4rem flex items-center justify-center border-b-2 md:border-b-4 cursor-pointer"
                       :class="selectIndex===1?'text-color62 border-color62':'text-color7D border-transparent'"
                       @click="selectIndex = 1">{{$t('profileView.post')}}</div>
                  <div class="flex-1 h-40px xl:h-2.4rem flex items-center justify-center border-b-2 md:border-b-4 cursor-pointer"
                       :class="selectIndex===0?'text-color62 border-color62':'text-color7D border-transparent'"
                        @click="selectIndex = 0">{{$t('profileView.curations')}}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-blockBg light:bg-white light:sm:bg-transparent sm:bg-transparent
                      container max-w-50rem mx-auto flex-1 pb-2rem sm:px-1rem">
            <Curations :accountInfo="accountInfo" v-show="selectIndex===0"/>
            <Post v-show="selectIndex === 1"
                  :accountInfo="accountInfo"
                  :steemBalance="steemBalance"
                  :key="$route.params.user"
                  @gotoDetail="gotoPostDetail"/>
          </div>
        </template>
        <div class="c-text-black text-1.8rem mb-3rem" v-else>
          <img class="w-5rem mx-auto py-3rem" src="~@/assets/profile-loading.gif" alt="" />
        </div>
      </div>
    </div>
    <van-popup class="md:w-600px bg-black light:bg-transparent rounded-t-12px"
               v-model:show="showTip"
               :position="position">
      <transition name="el-zoom-in-bottom">
        <div v-if="showTip"
             class="relative dark:bg-glass light:bg-colorF7 rounded-t-12px overflow-hidden">
             <TipModalVue class="flex-1 mt-40px" :tipToUser="{...accountInfo, username: accountInfo.twitterUsername}" @close="showTip=false" @back="showTip=false"/>
        </div>
      </transition>
    </van-popup>

  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { notify } from "@/utils/notify";
import { formatPrice, formatAmount } from "@/utils/helper";
import emptyAvatar from "@/assets/icon-default-avatar.svg";
import Post from './Post'
import WalletView  from "./WalletView";
import PostDetail from "./PostDetail";
import Curations from './Curations'
import TipModalVue from "@/components/TipModal.vue";
import { getUserInfo } from "@/utils/account";
import { ethers } from "ethers";
import { getTokenBalance } from "@/utils/asset";
import { ERC20List, TWITTER_MONITOR_RULE, SteemScan, TWITTER_POST_TAG } from "@/config";
import { getSteemBalance } from "@/utils/steem";
import {copyAddress} from "@/utils/tool";

export default {
  name: "AccountInfo",
  components: {
    Post,
    WalletView,
    PostDetail,
    Curations,
    TipModalVue
  },
  data() {
    return {
      userIsExist: true,
      loading: false,
      selectIndex: 1,
      tipDrawer: false,
      showRegistering: false,
      showNotSendTwitter: false,
      position: document.body.clientWidth < 768 ? "bottom" : "center",
      accountInfo: null,
      steemBalance: 0,
      erc20Balances: {},
      ethBalance: 0,
      showDetail: false,
      post: {},
      showTip: false,
      scroll: 0
    };
  },
  computed: {
    ...mapState([
      "prices"
    ]),
    ...mapGetters(['getAccountInfo']),
    totalValue() {
      if (this.erc20Balances && this.erc20Balances.ETH) {
        let t = 0;
        // eth
        //  t += this.erc20Balances['ETH'].ETH * this.prices['eth']
        for (let erc20 in this.erc20Balances["ETH"]) {
          t += this.erc20Balances.ETH[erc20] * this.prices[erc20.toLowerCase()];
        }
        // steem
        t += this.steemBalance * this.prices["steem"];

        // bsc
        for (let erc20 in this.erc20Balances["BNB"]) {
          t += this.erc20Balances.BNB[erc20] * this.prices[erc20.toLowerCase()];
        }
        //  // polygon
        for (let erc20 in this.erc20Balances["MATIC"]) {
          t +=
            this.erc20Balances.MATIC[erc20] * this.prices[erc20.toLowerCase()];
        }
        return formatPrice(t);
      }
      return "$0.00";
    },
    profileImg() {
      if (!this.accountInfo) return "";
      if (this.accountInfo.profileImg) {
        return this.accountInfo.profileImg.replace("normal", "400x400");
      } else {
        return (
          "https://profile-images.heywallet.com/" +
          this.accountInfo.twitterId
        );
      }
    },
  },
  methods: {
    copyAddress,
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
        "https://twitter.com/" + this.accountInfo.twitterUsername,
        "__blank"
      );
    },
    gotoSteem() {
      window.open(
        SteemScan + "@" + this.accountInfo.steemId,
        "__blank"
      );
    },
    gotoSend() {
      window.open(
        "https://twitter.com/intent/tweet?text=" +
        TWITTER_MONITOR_RULE +
        " !send   STEEM to ",
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
    gotoPostDetail(post) {
      this.post = post
      this.showDetail = true
    },
    tip() {
      if (!this.getAccountInfo || !this.getAccountInfo.twitterId) {
        this.$store.commit('saveShowLogin', true);
        return;
      }
      this.showTip = true
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
  async mounted() {
    const twitterUsername = this.$route.params.user.startsWith("@")
      ? this.$route.params.user.substring(1)
      : this.$route.params.user;
    // getUserInfo
    try {
      this.loading = true
      this.accountInfo = await getUserInfo(twitterUsername)
      const { steemId, ethAddress } = this.accountInfo;

      if (steemId) {
        // get steem balance
        getSteemBalance(steemId)
          .then((balance) => {
            this.steemBalance = balance.steemBalance
          })
          .catch((err) => console.log("get steem balance fail:", err));
      } else {
      }

      if (ethAddress) {
        this.erc20Balances = await getTokenBalance(ethAddress, false);

      }
    } catch (e) {

    } finally {
      this.loading = false
    }

  },
};
</script>

<style scoped>
.active-tab {
  background-image: linear-gradient(96.99deg, #AE88FE -31.47%, #923CFF 55.23%, #00B2FF 147.53%);
  background-repeat: no-repeat;
  background-size: 100% 0.3rem;
  background-position: center bottom;
}
.dark .inactive-tab {
  background-image: linear-gradient(#8483914D, #8483914D);
  background-repeat: no-repeat;
  background-size: 100% 0.3rem;
  background-position: center bottom;
}
</style>
