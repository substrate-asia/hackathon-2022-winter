<template>
  <div class="container mx-auto sm:max-w-600px lg:max-w-35rem px-15px pb-2rem text-14px xl:text-0.8rem">
    <div class="pt-25px sm:px-0 container mx-auto max-w-53rem md:max-w-48rem text-left">
      <span class="text-16px xl:text-1rem c-text-black relative whitespace-nowrap light:text-black">
        {{$t('walletView.tipHistory')}}
      </span>
    </div>
    <div class="bg-blockBg light:bg-white rounded-1rem mt-3rem">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh"
                loading-text="Loading"
                pulling-text="Pull to refresh data"
                loosing-text="Release to refresh">
        <van-list :loading="loading"
                  :finished="finished"
                  :immediate-check="false"
                  :loosing-text="$t('common.pullRefresh')"
                  :loading-text="$t('common.loading')"
                  :finished-text="$t('common.noMore')"
                  @load="onLoad">
          <!-- <div class="text-left p-1rem c-text-black md:text-1.2rem text-1.5rem">{{$t('transactionView.recentTransaction')}}</div> -->
          <div v-if="showingList.length===0 && !loading"
               class="px-1.5rem rounded-12px min-h-160px flex justify-center items-center">
            <div class="c-text-black text-color7D text-2rem mb-2rem">{{$t('common.none')}}</div>
          </div>
          <div class="border-b-1px border-listBgBorder p-1rem flex items-start"
               v-for="(item, index) of showingList" :key="index">
              <img v-if="!isReceive(item)" class="w-2.2rem min-w-30px mr-14px"
                   src="~@/assets/icon-up-arrow.svg" alt="">
              <img v-else class="w-2.2rem min-w-30px mr-14px"
                   src="~@/assets/icon-down-arrow.svg" alt="">
              <div class="flex-1">
                <div class="flex">
                  <div class="flex-1 text-text8F flex flex-col items-start sm:ml-1rem">
                    <div class="font-bold text-left text-14px xl:text-0.8rem"
                         :class="item.tipResult !== 0?'text-redColor':'light:text-blueDark'">
                      {{ isReceive(item) ? $t('transactionView.received') : $t('transactionView.sent') }}
                      {{item.tipResult !== 0?$t('transactionView.error'):''}}
                    </div>
                    <div class="text-color8B light:text-color7D text-12px xl:text-0.7rem mt-4px mb-6px">
                      {{ isReceive(item) ? $t('transactionView.from') : $t('transactionView.to') }} {{ getTargetAccount(item) }}
                    </div>
                    <div class="text-0.7rem mt-0.5rem text-color8B text-12px xl:text-0.7rem">{{ parseTime(item.postTime) }}</div>
                  </div>
                  <div class="flex flex-col justify-between items-end">
                    <ChainTokenIcon class="bg-black light:bg-colorD9"
                                    height="24px" width="24px"
                                    :chain-name="item.chainName.toString()"
                                    :token="{address: item.token, symbol: item.symbol}">
                      <template #amount>
                        <span class="px-8px h-24px whitespace-nowrap text-color8B light:text-blueDark
                                     flex items-center text-12px 2xl:text-0.8rem font-bold">
                          {{ isReceive(item) ? '+' : '-' }} {{ formatAmount(item) }} {{ item.symbol }}
                        </span>
                      </template>
                    </ChainTokenIcon>
                    <a v-if="item.tipResult === 0"
                       class="text-white rounded-full border-1 border-white/20 py-4px px-0.7rem w-max
                                light:text-blueDark light:border-colorE3 light:text-color7D"
                       :href="hashLink(item)" target="_blank">View</a>
                    <div v-else
                     class="text-redColor text-12px w-full text-left mt-4px sm:ml-1rem">
                      {{failResult(item) || ' Tokens has not been sent.'}}
                  </div>
                  </div>
                </div>
                
              </div>
            </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { EVM_CHAINS, SteemScan } from '@/config'
import { sleep, formatAmount } from '@/utils/helper'
import { ethers } from 'ethers'
import { getUsersTips } from '@/utils/account'
import ChainTokenIcon from "@/components/ChainTokenIcon";

export default {
  name: "Transaction",
  components: {ChainTokenIcon},
  data() {
    return {
      refreshing: true,
      loading: false,
      finished: false,
      selectIndex: 0,
      pageSize: 16,
      pageIndex: 0,
      chains: EVM_CHAINS
    }
  },
  computed: {
    ...mapState(['accountInfo', 'transactions', 'prices', 'tips']),
    ...mapGetters(['getAccountInfo']),
    showingList() {
      return this.tips
    }
  },
  methods: {
    isReceive(trans) {
      return trans.twitterId !== this.getAccountInfo.twitterId
    },
    failResult(trans) {
      switch(trans.tipResult) {
        case 0:
          return 'Success'
        case 1:
          return 'Insufficient balance'
        case 2:
          return 'Insufficient gas fee'
        case 3:
          return 'Transaction fail'
        case 4:
          return 'Target account not exist'
      }
    },
    hashLink(trans) {
      if (trans.chainName === 'STEEM') {
        return SteemScan + 'tx/' + trans.hash
      }else {
        const chain = Object.values(EVM_CHAINS).find(c => c.id === parseInt(trans.chainName));
        if (chain) {
          return chain.scan + 'tx/' + trans.hash
        }
      }
    },
    getValue(trans) {
      const amount = parseFloat(this.formatAmount(trans))
      const symbol = trans.symbol.toLowerCase()
      return '$' + formatAmount(amount * this.prices[symbol])
    },
    formatAmount(trans) {
      if (trans.chainName === 'STEEM')
        return formatAmount(trans.amount)
      const { token, decimals, symbol } = trans;
      const amount = trans.amount / (10 ** decimals);
      return formatAmount(amount)
    },
    getTargetAccount(trans) {
      if (this.isReceive(trans)){
        return '@' + trans.username
      }else {
        if (ethers.utils.isAddress(trans.targetUsername)) {
          return trans.targetUsername.substring(0, 10) + '......'
        }else {
          return '@' + trans.targetUsername
        }
      }
    },
    select(index) {
      this.selectIndex = index
      this.finished = false
      this.onRefresh()
    },
    onRefresh() {
      this.refreshing = true
      let time;
      getUsersTips({twitterId: this.getAccountInfo.twitterId,
            pageSize: this.pageSize,
            time,
            newTips: true}).then(res => {
        this.$store.commit('saveTips', res)
        this.refreshing = false
      }).catch(e => {
        console.log(33, e);
        if (e === 'log out') {
            this.$router.replace('/')
          }
      })
    },
    onLoad() {
      console.log('load more')
      if (this.finished || this.loading) return;
      let time;
      if (this.tips && this.tips.length > 0) {
        this.loading = true
        time = this.tips[this.tips.length - 1].postTime
        getUsersTips({twitterId: this.getAccountInfo.twitterId,
              pageSize: this.pageSize,
               time,
               newTips: false}).then(res => {
          this.$store.commit('saveTips', this.tips.concat(res))
          if (res.length < this.pageSize) {
            this.finished = true
          }
          this.loading = false
        }).catch(e => {
          console.log(22, e);
          if (e === 'log out') {
            this.$router.replace('/')
          }
          this.loading = false
          this.finished = true
        })
      }
    },
    parseTime(d) {
      const date = new Date(d)
      return date.toLocaleTimeString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute:'2-digit',
        second: '2-digit'
      })
    }
  },
  async mounted () {
    if(!this.getAccountInfo || !this.getAccountInfo.twitterUsername){
      this.$router.replace('/')
    }
    this.onRefresh()
  },
}
</script>

<style scoped>

</style>
