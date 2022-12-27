<template>
  <div class="pb-4rem md:pt-2rem pt-1.5rem md:max-w-600px lg:max-w-35rem mx-auto">
    <div class="rounded-12px mb-1rem overflow-hidden mx-1.5rem sm:mx-0">
      <div class="gradient-bg gradient-bg-color3 text-1rem px-1rem py-0.8rem flex items-center justify-center">
        <span class="c-text-black text-white">{{$t('profileView.ethWallet')}}</span>
        <!-- <button>
          <img class="w-1.2rem ml-0.5rem" src="~@/assets/icon-question-black.svg" alt="">
        </button> -->
      </div>
      <div class="border-1 border-t-0 border-dividerColor overflow-hidden rounded-b-12px
                  p-1.5rem font-700 text-0.8rem leading-1.4rem light:text-blueDark
                  break-all flex items-center justify-center">
        {{ accountInfo ? accountInfo.ethAddress : '' }}
        <i class="w-1.3rem h-1.3rem ml-1rem cursor-pointer icon-copy"
           @click="copy(accountInfo.ethAddress)"></i>
      </div>
    </div>
    <div class="bg-blockBg light:bg-white light:border-1 light:border-black/16 md:py-1.5rem rounded-12px">
      <div class="px-1.5rem text-14px w-min flex gap-1rem h-2rem md:h-1.6rem">
        <div class="px-0.8rem flex items-center rounded-full border-1 border-white/20 cursor-pointer text-15px"
             :class="selectIndex===0?'gradient-bg text-white':'border-1 border-white/40 light:border-colorE3 text-color84 light:text-color7D light:bg-colorF2'"
             @click="selectIndex = 0">{{$t('common.token')}}</div>
        <div class="px-0.8rem flex items-center rounded-full border-1 border-white/20 cursor-pointer text-15px"
             :class="selectIndex===1?'gradient-bg text-white':'border-1 border-white/40 light:border-colorE3 text-color84 light:text-color7D light:bg-colorF2'"
             @click="selectIndex = 1">{{$t('common.nft')}}</div>
        <!-- <router-link :to="`/profile/${$route.params.user}/wallet`"
                     class="px-0.8rem flex items-center rounded-full border-1 border-white/20">Token</router-link>
        <router-link :to="`/profile/${$route.params.user}/wallet/nft`"
                     class="px-0.8rem flex items-center rounded-full border-1 border-white/20">NFTs</router-link> -->
      </div>
      <Token v-show="selectIndex===0" :erc20Balances="erc20Balances" :steemBalance="steemBalance"></Token>
      <NFT v-show="selectIndex===1" :accountInfo="accountInfo"></NFT>
    </div>
  </div>
</template>

<script>
import {ethers} from "ethers";
import {notify} from "@/utils/notify";
import Token from './Token'
import NFT from './NFT'

export default {
  name: 'WalletView',
  props: {
    accountInfo: {
      type: Object,
      default: {}
    },
    erc20Balances:{
      type: Object
    },
    steemBalance: {
      type: Number
    }
  },
  data() {
    return {
      selectIndex: 0
    }
  },
  computed: {
  },
  components: {
    Token,
    NFT
  },
  methods: {
    copy(address) {
      if (ethers.utils.isAddress(address)) {
        navigator.clipboard.writeText(address).then(() => {
          notify({
            message: 'Copied address:'+address,
            duration: 5000,
            type: 'success'
          })
        }, (e) => {
          console.log(e)
        })
      }
    }
  },
}
</script>

<style scoped>
.top-box {
  background: linear-gradient(99.28deg, rgba(83, 83, 83, 0.8) 0.41%, rgba(78, 72, 61, 0.8) 75.78%);
  border: 1px solid #323436;
  border-radius: 12px;
}
.router-link-exact-active {
  background-color: var(--primary-custom);
}
</style>
