<template>
  <div class="text-left px-1.25rem pb-3rem sm:pb-1.5rem flex flex-col text-14px 2xl:text-0.8rem overflow-auto">
    <div class="flex-1">
      <div class="text-20px 2xl:text-1rem c-text-black mb-1rem">Tip</div>
      <div>To @{{tipToUser.username}}</div>
      <AssetsOptions :amount="form.amount"
                     :chain="'steem'"
                     :showEvm="!!tipToUser.ethAddress"
                     :showsteem="true"
                     @chainChange="selectChain"
                     @tokenChagne="selectToken"
                     @addressChange="selectAddress"
                     @amountChange="selectAmount"
                     @balanceChange="selectBalance"
                     @selectGift="selectGift">
      </AssetsOptions>
    </div>
    <div class="flex items-center justify-center gap-x-1rem">
      <button class="gradient-btn gradient-btn-disabled-grey
                     h-44px 2xl:h-2.2rem w-full rounded-full text-16px 2xl:text-0.8rem"
              @click="$emit('back')">back</button>
      <button class="gradient-btn gradient-btn-disabled-grey flex items-center justify-center
                     h-44px 2xl:h-2.2rem w-full rounded-full text-16px 2xl:text-0.8rem"
              @click="send"
              :disabled="form.amount>selectedBalance || form.amount === 0 || tiping">
              Send
              <c-spinner v-show="tiping" class="w-1.5rem h-1.5rem ml-0.5rem" color="#6246EA"></c-spinner>
        </button>
    </div>
  </div>
</template>

  <script>
  import { EVM_CHAINS, TWITTER_MONITOR_RULE } from '@/config'
  import AssetsOptions from "@/components/AssetsOptions";
  import { mapGetters } from "vuex";
  import { sendTokenToUser } from '@/utils/asset'
  import { tipEVM } from '@/utils/curation'
  import { ethers } from 'ethers';

  export default {
    name: "TipModal",
    props: {
        tipToUser: {
            type: Object,
            default: {}
        },
        parentTweetId: {
         type: String
        }
    },
    components: {
      AssetsOptions,
    },
    computed: {
      ...mapGetters(['getAccountInfo']),
      ...mapGetters('curation', ['getPendingTip']),
    },
    data() {
      return {
        step: 1,
        host: {},
        coHosts: [],
        speakers:[],
        form: {
          chain: '',
          address: '',
          token: '',
          amount: 0,
          emoji: null
        },
        selectedToken: {},
        selectedBalance: '',
        tiping: false
      }
    },
    methods: {
      avatar(url) {
        return url.replace('normal', '200x200')
      },
      selectChain(chain){
        this.form.chain = chain
      },
      selectAddress(address) {
        this.form.address = address
      },
      selectToken(token) {
        this.selectedToken = token;
        this.form.token = token.address;
      },
      selectAmount(amount) {
        this.form.amount = amount
        this.form.emoji = null;
      },
      selectBalance(balance) {
        this.selectedBalance = balance
      },
      selectGift(gift) {
        this.form.amount = gift.value;
        this.form.emoji = gift.img
      },
      async send() {
        try {
          if (this.form.chain === 'steem') {
            window.open(`https://twitter.com/intent/tweet?in_reply_to=${this.parentTweetId}&text=${TWITTER_MONITOR_RULE} !tip ${this.form.emoji ?? (this.form.amount + ' STEEM')}  to @${this.tipToUser.username}`,'__blank')
          }else {
            this.tiping = true
            const transHash = await sendTokenToUser(this.selectedToken, this.form.amount, this.tipToUser.ethAddress)
            const tip = {
              twitterId: this.getAccountInfo.twitterId,
              targetTwitterId: this.tipToUser.twitterId ?? this.tipToUser.authorId,
              fromAddress: this.form.address,
              toAddress: this.tipToUser.ethAddress,
              transHash,
              chainName: EVM_CHAINS[this.form.chain].id,
              token: this.form.token,
              symbol: this.selectedToken.symbol,
              decimals: this.selectedToken.decimals,
              amount: ethers.utils.parseUnits(this.form.amount.toString(), this.selectedToken.decimals).toString(),
              parentTweetId: this.parentTweetId
            }
            this.$store.commit('curation/savePendingTip', tip)
            await tipEVM(tip);
            this.$store.commit('curation/savePendingTip', null)
          }
          this.$emit('close')
        }catch(e) {
          console.log('Tip to user fail:', e);
        }finally{
          this.tiping = false
        }
      }
    },
    mounted () {
      const pendingTip = this.getPendingTip;
      if (pendingTip) {
        tipEVM(pendingTip).then(res => {
          this.$store.commit('curation/savePendingTip', null)
        }).catch(e => {
          console.log('upload cache tip fail:', e);
        }).finally(() => {
        })
      }
    },
  }
  </script>

  <style scoped>

  </style>
