<template>
  <div class="text-left pb-3rem sm:pb-1.5rem h-80vh flex flex-col text-14px 2xl:text-0.8rem overflow-auto">
    <div class="relative">
      <div class="flex justify-center items-center py-20px">
        <i v-for="i of 2" :key="i"
           class="block w-10px h-10px min-w-10px h-min-10px rounded-full mx-15px"
           :class="step===i?'bg-color62':'bg-colorD6'"></i>
      </div>
      <button v-show="step>1" class="absolute left-20px top-1/2 transform -translate-y-1/2"
              @click="step-=1">
        <i class="w-20px h-20px 2xl:w-1.2rem 2xl:h-1.2rem icon-back"></i>
      </button>
      <button class="absolute right-20px top-1/2 transform -translate-y-1/2"
           @click="$emit('close')">
        <i class="w-18px h-18px 2xl:w-1rem 2xl:h-1rem icon-close"></i>
      </button>
    </div>
    <div class="text-20px 2xl:text-1.2rem c-text-black text-left sm:text-center px-1.5rem mt-2rem">
      {{$t('popup.create')}}
    </div>
    <div v-if="step===1" class="flex-1 px-1.5rem mt-0.5rem flex flex-col">
      <div class="flex-1">
        <div class="mt-0.5rem mb-2rem text-color7D">{{$t('popup.popupTip')}}</div>
        <div class="flex justify-between items-center mt-35px">
          <span class="font-bold text-14px 2xl:text-0.8rem mb-10px">{{$t('popup.quickTweet')}}</span>
        </div>
        <div class="border-1 bg-black/40 border-1 border-color8B/30
                    light:bg-white light:border-colorE3 hover:border-primaryColor
                    rounded-8px">
          <div contenteditable
               class="desc-input px-1rem pt-1rem min-h-6rem whitespace-pre-line leading-24px xl:leading-1.2rem"
               ref="contentRef"
               @blur="getBlur('desc')"
               @paste="onPasteEmojiContent"
               v-html="form.contentEl"></div>
          <div class="py-2 border-color8B/30 flex justify-between">
            <el-popover ref="descEmojiPopover" :placement="position"
                        trigger="click" width="300"
                        :teleported="false"
                        :persistent="false">
              <template #reference>
                <img class="w-1.8rem h-1.8rem lg:w-1.4rem lg:h-1.4rem mx-8px" src="~@/assets/icon-emoji.svg" alt="">
              </template>
              <div class="h-310px">
                <EmojiPicker :options="{
                                imgSrc:'/emoji/',
                                locals: $i18n.locale==='zh'?'zh_CN':'en',
                                hasSkinTones:false,
                                hasGroupIcons:false}"
                                @select="selectEmoji" />
              </div>
            </el-popover>
            <div class="p-0.5rem text-right text-color62 font-bold">#iweb3 #popup</div>
          </div>
        </div>
        <div class="flex justify-between items-center mt-2rem">
          <span class="font-bold text-14px 2xl:text-0.8rem mb-10px">Duration</span>
        </div>
        <div class="w-full bg-black/40 border-1 border-color8B/30
                    light:bg-white light:border-colorE3 flex items-center
                    rounded-8px overflow-hidden h-44px 2xl:h-2.1rem">
          <CustomSelect v-model="form.duration">
            <template #options>
              <div class="bg-blockBg light:bg-white border-1 border-color8B/30
                          light:border-colorE3 rounded-8px overflow-hidden">
                <el-option
                    v-for="item in durationOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </div>
            </template>
          </CustomSelect>
        </div>
      </div>
      <div class="text-center mb-1.4rem mt-2rem">
        <button class="gradient-btn h-44px 2xl:h-2.2rem w-full rounded-full text-16px 2xl:text-0.8rem"
                @click="onNext">
                {{ $t('common.next') }}
          </button>
      </div>
    </div>
    <div v-if="step===2" class="flex-1 px-1.5rem mt-0.5rem flex flex-col">
      <div class="flex-1">
        <div class="flex justify-between items-center mt-45px">
          <span class="font-bold text-14px 2xl:text-0.8rem mb-10px">Maximum reward users</span>
        </div>
        <div class="w-full border-1 bg-black/40 border-1 border-color8B/30
                  flex justify-between items-center
                  light:bg-white light:border-colorE3 hover:border-primaryColor
                  rounded-8px h-44px 2xl:h-2.1rem">
          <input class="bg-transparent h-full w-full px-12px text-color7D"
                 v-model="form.maxReward"
                 type="number"
                 placeholder="">
          <span class="whitespace-nowrap px-12px text-colorD6">Limited 100</span>
        </div>
        <AssetsOptions :amount="form.amount"
                       :chain="form.chain"
                       :address="form.address"
                       :token="form.token"
                       :showsteem="false"
                       @chainChange="selectChain"
                       @tokenChagne="selectToken"
                       @addressChange="selectAddress"
                       @amountChange="selectAmount"
                       @balanceChange="selectBalance"
                       @selectGift="selectGift">
        </AssetsOptions>
      </div>
      <div class="text-center mt-2rem">
        <button class="gradient-btn gradient-btn-disabled-grey flex justify-center items-center
                       h-44px 2xl:h-2.2rem w-full rounded-full text-16px 2xl:text-0.8rem"
                :disabled="creating"
                @click="onSubmit">
                {{$t('common.sendAndCreate')}}
                <c-spinner v-show="creating" class="w-1.5rem h-1.5rem ml-0.5rem" color="#6246EA"></c-spinner>
              </button>
      </div>
    </div>
    <van-popup v-if="modalVisible" class="w-full 2xl:w-2/5"
                v-model:show="modalVisible" position="center">
      <div class="bg-black light:bg-white rounded-12px mx-15px">
        <div class="dark:bg-glass light:bg-white rounded-12px flex-1 overflow-auto
                    px-1.5rem no-scroll-bar px-15px py-2rem xl:p-1rem">
          <SendTokenTipVue class=""
                           :token="selectedToken"
                           :amount="form.amount"
                           :chainName="form.chain"
                           :address="form.address"
                           :approveContract="EVM_CHAINS[form.chain].popup"
                           @create="createPopup"
                           @confirmComplete="modalVisible=false"
                           @close="modalVisible=false">
            <template #desc>{{$t('popup.createTip', {rewards:  this.form.amount + ' ' + this.selectedToken.symbol})}}</template>
          </SendTokenTipVue>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import AssetsOptions from "@/components/AssetsOptions";
import { EVM_CHAINS, CURATION_SHORT_URL } from '@/config'
import SendTokenTipVue from "./SendTokenTip.vue";
import CustomSelect from "@/components/CustomSelect";
import { EmojiPicker } from 'vue3-twemoji-picker-final'
import { mapGetters, mapState } from "vuex";
import { notify } from "@/utils/notify";
import { sleep, stringLength } from "@/utils/helper";
import {formatEmojiText, onPasteEmojiContent} from "@/utils/tool";
import { userTweet } from '@/utils/twitter'
import { createPopup, newPopups } from '@/utils/curation'
import { ethers } from "ethers";

export default {
  name: "CreatePopUpModal",
  components: {AssetsOptions, SendTokenTipVue, CustomSelect, EmojiPicker},
  data() {
    return {
      position: document.body.clientWidth < 768?'bottom':'right',
      step: 1,
      durationOptions: [
        {label: '5 min', value: 5},
        {label: '10 min', value: 10},
        {label: '15 min', value: 15},
        {label: '20 min', value: 20},
        {label: '25 min', value: 25},
        {label: '30 min', value: 30},
        {label: '35 min', value: 35},
        {label: '40 min', value: 40},
        {label: '45 min', value: 45},
        {label: '50 min', value: 50},
        {label: '55 min', value: 55},
        {label: '60 min', value: 60},
      ],
      form: {
        content: '',
        contentEl: '',
        duration: 5,
        maxReward: 100,
        chain: '',
        address: '',
        token: '',
        amount: 0,
        tweetId: '',
        emoji: ''
      },
      EVM_CHAINS,
      modalVisible: false,
      selectedToken: {},
      selectedBalance: '',
      approvement: false,
      approving: false,
      creating: false,
      durationPopper:false,
      contentRange: null,
      tweetLength: 0,
    }
  },
  computed: {
    ...mapState('curation', ['detailCuration', 'getPendingPopup']),
    ...mapGetters(['getAccountInfo'])
  },
  methods: {
    getBlur() {
      const sel = window.getSelection();
      this.contentRange = sel.getRangeAt(0);
    },
    onPasteEmojiContent,
    formatEmojiText,
    selectEmoji(e) {
      const newNode = document.createElement('img')
      newNode.alt = e.i
      newNode.src = e.imgSrc
      newNode.className = 'inline-block w-18px h-18px mx-2px'
      if(!this.contentRange) return
      this.contentRange.insertNode(newNode)
      this.$refs.descEmojiPopover.hide()
    },
    formatElToTextContent(el) {
      el.innerHTML = el.innerHTML.replaceAll('<div>', '\n')
      el.innerHTML =el.innerHTML.replaceAll('</div>', '\n')
      el.innerHTML =el.innerHTML.replaceAll('<br>', '')
      let content = ''
      let tweetLength = 0;
      for(let i of el.childNodes) {
        if(i.nodeName==='#text') {
          tweetLength += stringLength(i.textContent);
          content += i.textContent
        } else if(i.nodeName === 'IMG') {
          tweetLength+=2;
          content += i.alt
        }
      }
      this.tweetLength = tweetLength
      return content
    },
    onNext() {
      this.form.contentEl = this.$refs.contentRef.innerHTML
      this.form.content = this.formatElToTextContent(this.$refs.contentRef)
      this.step = 2
      console.log(this.form.content, this.form.contentEl, this.tweetLength)
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
    },
    selectBalance(balance) {
      this.selectedBalance = balance
    },
    selectGift(gift) {
      this.form.amount = gift.value;
      this.form.emoji = gift.img
    },
    checkForm() {
      if (this.tweetLength > (255 - CURATION_SHORT_URL.length)) {
        notify({message: this.$t('tips.textLengthOut'), type:'info'})
        return false
      }
      if (!this.form.maxReward.toString().match(/^([1-9]?\d|100)$/) || this.form.maxReward === 0) {
        notify({message: this.$t('err.wrongUserNumber'), type:'info'})
        return false
      }
      if (this.selectedBalance < this.form.amount) {
        notify({message: this.$t('curation.insuffientBalance'), type:'error'})
        return false
      }
      if (this.form.amount === 0) {
        notify({message: this.$t('curation.inputRewardsAmount'), type:'info'})
        return false;
      }
      return true;
    },
    async onSubmit() {
      if (!this.checkForm()) {
        return
      }
      try{
        this.creating = true
        // tweet
        this.form.tweetId = await userTweet(this.form.content + '\n#iweb3 #popup\nSee more here:' + CURATION_SHORT_URL + this.detailCuration.curationId)
        this.modalVisible =true
        if (this.form.tweetId) {
          this.modalVisible = true
        }else {
          notify({message: this.$t('popup.tweetFail'), type:'error'})
        }
      } catch (e) {
      } finally {
        this.creating = false
      }
    },
    async createPopup() {
      try{
        this.creating = true
        let popup = {
          curationId: this.detailCuration.curationId,
          popupTweetId: this.form.tweetId,
          endTime: Math.floor(new Date().getTime() / 1000) + this.form.duration * 60,
          winnerCount: this.form.maxReward,
          token: this.form.token,
          bonus: ethers.utils.parseUnits(this.form.amount.toString(), this.selectedToken.decimals)
        }
        const hash = await createPopup(this.form.chain, popup)
        if (hash) {
        //   curationId, chainId, creatorEth, tweetId, twitterId, endTime,
        // token, symbol, decimals, bonus, maxCount, transHsh
          let pendingPopup = {
            twitterId: this.getAccountInfo.twitterId,
            curationId: this.detailCuration.curationId,
            chainId: EVM_CHAINS[this.form.chain].id,
            creatorETH: this.form.address,
            tweetId: this.form.tweetId,
            endTime: this.form.duration * 60,
            token: this.form.token,
            symbol: this.selectedToken.symbol,
            decimals: this.selectedToken.decimals,
            bonus: ethers.utils.parseUnits(this.form.amount.toString(), this.selectedToken.decimals).toString(),
            maxCount: this.form.maxReward,
            transHash: hash
          }
          pendingPopup = {
            twitterId: this.getAccountInfo.twitterId,
            curationId: this.detailCuration.curationId,
            chainId: EVM_CHAINS[this.form.chain].id,
            creatorETH: this.form.address,
            tweetId: this.form.tweetId,
            endTime: this.form.duration * 60,
            token: this.form.token,
            symbol: this.selectedToken.symbol,
            decimals: this.selectedToken.decimals,
            bonus: ethers.utils.parseUnits(this.form.amount.toString(), this.selectedToken.decimals).toString(),
            maxCount: this.form.maxReward,
            transHash: hash
          }
          this.$store.commit('curation/savePendingPopup', pendingPopup)
          await newPopups(pendingPopup);
          this.$store.commit('curation/savePendingPopup', null)
          this.$emit('close')
          this.modalVisible = false
        }else {
          notify({message: this.$t('err.contractError'), type: 'error'})
        }
      } catch (e) {
        console.log('create popup fail:', e);
        if (e === 'log out') {
          notify({message: this.$t('tips.accessTokenExpire'), type:'info'})
          this.$router.go('/')
        }
      } finally {
        this.creating = false
      }
    }
  },
  mounted() {
    if (this.getPendingPopup) {
      newPopups(pendingPopup).then(res => {
        this.$store.commit('curation/savePendingPopup', null)
      }).catch(e => {
        if (e === 'log out') {
          notify({message: this.$t('tips.accessTokenExpire'), type:'info'})
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
