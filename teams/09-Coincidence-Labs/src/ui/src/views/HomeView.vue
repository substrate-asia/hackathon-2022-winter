<template>
  <div class="home">
    <div class="container mx-auto lg:mt-5rem mt-20vh px-0.75rem">
      <div class="fade-in">
        <div class="c-text-black text-2.6rem leading-4.2rem max-w-20rem sm:max-w-35rem sm:mx-auto mb-2.3rem px-2rem text-left sm:text-center">
          <span class="gradient-text gradient-text-right3 block mx-auto">{{$t('signUpView.t1')}}</span>
          {{$t('signUpView.t2')}}
        </div>
      </div>
      <button @click="fetchKey"
              class="slide-in-blurred-top gradient-btn gradient-btn-outline w-20rem h-4rem mx-auto rounded-full c-text-bold text-1.2rem">
       {{$t('signUpView.btn1')}}
      </button>
      <div class="fade-in">
        <div class="mt-2rem">
          {{$t('signUpView.p1')}}
        </div>
        <router-link to="/login"
                     class="c-text-black text-15px leading-24px 2xl:text-1rem 2xl:leading-1.5rem mt-1rem underline">
          {{$t('signUpView.p2')}}
        </router-link>
      </div>
    </div>
    <!--  Verify modal -->
    <el-dialog :destroy-on-close="true" v-model="showPrivateKey"
               class="c-dialog c-dialog-lg c-dialog-center">
      <CreateAccount :ethAccount="accountInfo" :referee="referee" @send="sendTwitter($event)"></CreateAccount>
    </el-dialog>
  </div>
</template>

<script>
import CreateAccount from "@/views/CreateAccount";
import { TWITTER_MONITOR_RULE } from '@/config'
import { randomEthAccount } from '@/utils/ethers'
import { notify } from "@/utils/notify";

export default {
  name: 'HomeView',
  components: {
    CreateAccount
  },
  data: () => {
    return {
      generatingKeys: false,
      showPrivateKey: false,
      ethAddress: '',
      accountInfo: {},
      referee: ''
    }
  },
  computed: {
  },
  methods: {
    showNotify(message, duration, type) {
        notify({message, duration, type})
    },
    async fetchKey() {
      try {
        this.$store.commit('saveEthAddress', null)
        const account = randomEthAccount()
        this.accountInfo = account
        this.ethAddress = account.ethAddress
        this.showPrivateKey = true
      }catch(e) {
        this.showNotify(e.toString(), 5000, 'error')
      }
    },
    sendTwitter(referee) {
      this.$store.commit('saveEthAddress', this.ethAddress)
      window.open('https://twitter.com/intent/tweet?text=' + TWITTER_MONITOR_RULE + ' !create wormhole account:' + this.ethAddress + (referee.length > 0 ? ` ${referee}` : '') + '%0a(Powerd by https://alpha.wormhole3.io)', '__blank')
    },
  },
  async mounted() {
    const referee = this.$route.params
    if (referee.referee && referee.referee.length > 0) {
      this.referee = referee.referee
    }
  },
}
</script>
<style lang="scss">
</style>
