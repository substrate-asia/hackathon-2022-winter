<template>
  <div class="pb-2rem pt-1rem px-1.5rem">
    <!-- <div class="flex justify-between items-center py-1rem px-1.5rem border-b-1 border-listBgBorder"
         v-if="erc20Balances && erc20Balances.ETH" v-for="erc20 of Object.keys(erc20Balances.ETH)" :key="erc20 + 'eth'">
      <div class="flex items-center">
        <img class="w-43px h-43px 2xl:w-2rem 2xl:h-2rem rounded-full border-2px gradient-border"
             :src="icons[erc20]" alt="">
        <div class="text-left ml-1rem">
          <div class="c-text-black text-1.3rem md:text-1rem light:text-blueDark">{{names[erc20]}}</div>
          <div class="text-color8B light:text-color7D text-0.75rem font-bold mt-0.5rem">{{ formatAmount(erc20Balances.ETH[erc20]) }} {{erc20}}</div>
        </div>
      </div>
      <div class="flex flex-col items-end justify-end">
        <div class="text-1.5rem md:text-1rem text-primaryColor light:text-blueDark c-text-black">${{formatAmount(erc20Balances.ETH[erc20] * prices[erc20.toLowerCase()])}}</div>
      </div>
    </div> -->

    <!-- <div class="flex justify-between items-center py-1rem px-1.5rem border-b-1 border-listBgBorder"
         v-if="erc20Balances && erc20Balances.BNB" v-for="erc20 of Object.keys(erc20Balances.BNB)" :key="erc20 + 'eth'">
      <div class="flex items-center">
        <img class="w-43px h-43px 2xl:w-2rem 2xl:h-2rem rounded-full border-2px gradient-border"
             :src="icons[erc20]" alt="">
        <div class="text-left ml-1rem">
          <div class="c-text-black text-1.3rem md:text-1rem light:text-blueDark">{{names[erc20]}}(BSC)</div>
          <div class="text-color8B light:text-color7D text-0.75rem font-bold mt-0.5rem">{{ formatAmount(erc20Balances.BNB[erc20]) }} {{erc20}}</div>
        </div>
      </div>
      <div class="flex flex-col items-end justify-end">
        <div class="text-1.5rem md:text-1rem text-primaryColor light:text-blueDark c-text-black">${{formatAmount(erc20Balances.BNB[erc20] * prices[erc20.toLowerCase()])}}</div>
      </div>
    </div> -->

    <div class="flex justify-between items-center py-1rem border-b-1 border-listBgBorder c-list-item"
         v-if="(erc20Balances && erc20Balances.Polygon)" v-for="erc20 of Object.keys(erc20Balances.Polygon)" :key="erc20 + 'matic'">
      <div class="flex items-center">
        <img class="w-43px h-43px 2xl:w-2rem 2xl:h-2rem rounded-full border-1px gradient-border"
             :src="icons[erc20]" alt="">
        <div class="text-left ml-1rem">
          <div class="font-600 text-1.3rem md:text-1rem light:text-blueDark">{{names[erc20]}}</div>
          <div class="text-color8B light:text-color7D text-0.75rem mt-0.5rem">{{ formatAmount(erc20Balances.Polygon[erc20]) }} {{erc20}}</div>
        </div>
      </div>
      <div class="flex flex-col items-end justify-end">
        <div class="text-1.5rem md:text-1rem text-primaryColor light:text-blueDark c-text-black">${{formatAmount(erc20Balances.Polygon[erc20] * prices[erc20.toLowerCase()])}}</div>
      </div>
    </div>

    <div class="flex justify-between items-center py-1rem border-b-1 border-listBgBorder c-list-item">
      <div class="flex items-center">
        <img class="w-43px h-43px 2xl:w-2rem 2xl:h-2rem rounded-full border-1px gradient-border"
            src="https://cdn.wherein.mobi/nutbox/token/logo/steem.png" alt="">
        <div class="text-left ml-1rem">
          <div class="flex items-center">
            <div class="font-600 text-1.3rem md:text-1rem light:text-blueDark">Steem</div>
            <el-tooltip popper-class="shadow-popper-tip">
              <template #content>
                <div class="max-w-14rem text-white light:text-blueDark">
                  {{$t('common.whatsSteem')}}
                </div>
              </template>
              <button>
                <img class="w-1rem ml-0.5rem" src="~@/assets/icon-warning-grey.svg" alt="">
              </button>
            </el-tooltip>
          </div>
          <div class="text-color8B light:text-color7D text-0.75rem mt-0.5rem">{{ formatAmount(steemBalance) }} STEEM</div>
        </div>
      </div>
      <div class="flex flex-col items-end justify-end">
        <div class="text-1.5rem md:text-1rem text-primaryColor light:text-blueDark c-text-black">{{ steemValue }}</div>
        <button class="c-text-bold mt-8px rounded-full text-color62" @click="sendSteem">{{$t('common.send')}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { formatBalance, formatUserAddress, formatPrice, formatAmount, sleep } from '@/utils/helper'
import { getTokenBalance, getUserTokensFromCuration } from '@/utils/asset'
import { TWITTER_MONITOR_RULE, TokenIcon, TokenName, EVM_CHAINS } from '@/config'
import { getSteemBalance } from '@/utils/steem'
import {ethers} from "ethers";
import {notify} from "@/utils/notify";

export default {
  name: "Token",
  data() {
    return {
      ethBalanceInterval: null,
      monitor: null,
      icons: TokenIcon,
      names: TokenName
    }
  },
  computed: {
    ...mapState(['steemBalance', 'prices', 'ethBalance', 'erc20Balances', 'accountInfo']),
    ...mapGetters(['getAccountInfo']),
    steemValue() {
      if (this.prices['steem'] && this.steemBalance){
        return formatPrice(this.prices['steem'] * this.steemBalance)
      }
      return formatPrice(0)
    },
    ethValue() {
      if (this.prices['eth'] && this.erc20Balances && this.erc20Balances.ETH){
        return formatPrice(this.prices['eth'] * this.erc20Balances['ETH'].ETH)
      }
      return formatPrice(0)
    },
  },
  methods: {
    formatAmount(a) {
      return formatAmount(a)
    },
    sendSteem() {
      window.open('https://twitter.com/intent/tweet?text=' + TWITTER_MONITOR_RULE + ' !send 1 STEEM to @', '__blank')
    },
    sendToken(token, chain) {
      window.open(`https://twitter.com/intent/tweet?text=${TWITTER_MONITOR_RULE} !send ${token}${token === chain ? '' : ('('+chain +')')} to `, '__blank')
    },
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
  async mounted () {
      if (this.getAccountInfo) {
        const { steemId, ethAddress, steemAmount, isRegistry, twitterId } = this.getAccountInfo

        if (!isRegistry) {
          getUserTokensFromCuration(twitterId).then(res => {
            const {tokens, amounts} = res;
            const tempTokens = Object.values(EVM_CHAINS.MATIC.assets);
            let showingBalance = {MATIC: {}}
            for (let j = 0; j < tempTokens.length; j++) {
              for (let i = 0; i < tokens.length; i++) {
                if (tokens[i] === tempTokens[j].address) {
                  showingBalance.MATIC[tempTokens[j].symbol] = amounts[i].toString() / (10 ** tempTokens[j].decimals);
                  break;
                }
              }
              showingBalance.MATIC[tempTokens[j].symbol] = showingBalance.MATIC[tempTokens[j].symbol] ?? 0
            }
            this.$store.commit('saveERC20Balances', showingBalance)
          }).catch(e => {
            console.log(6878, e);
          })
        }

        if (steemId) {
          // get steem balance
          getSteemBalance(steemId).then(balance => {
              this.$store.commit('saveSteemBalance', balance.steemBalance)
              this.$store.commit('saveSbdBalance', balance.sbdBalance)
            })
              .catch(err => console.log('get steem balance fail:', err))
        }else {
          this.$store.commit('saveSteemBalance', steemAmount ?? 0)
        }

        //get eth balances
        if (ethAddress) {
          getTokenBalance(ethAddress)
        }
      }
  }
}
</script>

<style scoped>
.c-list-item:last-child {
  border: none;
}
</style>
