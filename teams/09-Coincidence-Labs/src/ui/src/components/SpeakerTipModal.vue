<template>
  <div class="text-left text-14px 2xl:text-0.8rem flex flex-col pb-3rem sm:pb-1.5rem">
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
    <div v-if="step===1" class="px-1.25rem flex-1 overflow-auto mt-40px">
      <div class="text-20px 2xl:text-1rem c-text-black mb-1rem">Tip</div>
      <div class="text-color7D">
        You can send tips directly to any twitter account, regardless he/she has a wallet or not
      </div>
      <div class="mt-2rem font-bold">Host</div>
      <div class="py-1rem flex flex-wrap gap-x-2rem">
        <div class="flex flex-col justify-center items-center py-0.5rem w-60px sm:w-80px truncate cursor-pointer"
             @click="tip(host)">
          <div class="border-2 gradient-border gradient-border-color3 rounded-full relative mt-10px">
            <img v-if="host.profileImg"
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full"
                 :src="avatar(host.profileImg)" alt="">
            <img v-else
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 src="~@/assets/icon-default-avatar.svg" alt="">
            <img class="absolute -top-10px -left-8px" src="~@/assets/tag-host.svg" alt="">
          </div>
          <span class="w-full text-center truncate mt-4px">{{host.name}}</span>
        </div>
        <div class="flex flex-col justify-center items-center py-0.5rem w-60px sm:w-80px truncate cursor-pointer"
             v-for="u of coHosts" :key="'co' + u.twitterId"
             @click="tip(u)">
          <div class="border-2 gradient-border gradient-border-color3 rounded-full relative mt-10px">
            <img v-if="u.profileImg"
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 :src="avatar(u.profileImg)" alt="">
            <img v-else
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 src="~@/assets/icon-default-avatar.svg" alt="">
            <img class="absolute -top-10px -left-8px" src="~@/assets/tag-co-hosts.svg" alt="">
          </div>
          <span class="w-full text-center truncate mt-4px">{{u.name}}</span>
        </div>
      </div>
      <div class="font-bold mt-2rem">Speakers</div>

      <div class="py-1rem flex flex-wrap gap-x-2rem">
        <div class="flex flex-col justify-center items-center py-0.5rem w-60px sm:w-80px truncate cursor-pointer"
             v-for="s of speakers" :key="s"
             @click="tip(s)">
          <div class="border-2 gradient-border gradient-border-color3 rounded-full mt-10px">
            <img v-if="s.profileImg"
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 :src="avatar(s.profileImg)" alt="">
            <img v-else
                 class="w-40px h-40px border-2px border-blockBg light:border-white rounded-full "
                 src="~@/assets/icon-default-avatar.svg" alt="">
          </div>
          <span class="w-full text-center truncate mt-4px">{{s.name}}</span>
        </div>
      </div>
    </div>
    <template v-if="step===2">
      <TipModalVue class="flex-1 mt-40px" :tipToUser="tipToUser" :parent-tweet-id="parentTweetId" @close="$emit('close')" @back="step=1"/>
    </template>
  </div>
</template>

<script>
import { EVM_CHAINS, TWITTER_MONITOR_RULE } from '@/config'
import { mapGetters } from "vuex";
import { sendTokenToUser } from '@/utils/asset'
import { tipEVM } from '@/utils/curation'
import { ethers } from 'ethers';
import TipModalVue from './TipModal.vue';

export default {
  name: "SpeakerTipModal",
  props: {
    space: {
      type: Object,
      default: {}
    },
    // Parent tweet id, need to comment to this tweet if chose tip steem
    parentTweetId: {
      type: String
    }
  },
  components: {
    TipModalVue
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
        amount: 0
      },
      tipToUser: {},
      selectedToken: {},
      selectedBalance: ''
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
    selectBalance(balance) {
      this.selectedBalance = balance
    },
    selectGift(gift) {
      this.form.amount = gift.value
    },
    tip(user) {
      this.tipToUser = user;
      this.step = 2;
    }
  },
  mounted () {
    if (this.space.hosts && this.space.hosts.length > 0) {
      this.host = this.space.hosts.find(h => h.twitterId === this.space.creatorId)
      this.coHosts = this.space.hosts.filter(h => h.twitterId !== this.space.creatorId);
      this.speakers = this.space.speakers;
    };

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
