<template>
  <div class="w-full h-full overflow-auto">
    <div class="mx-auto text-white light:text-blueDark">
      <div v-if="step===1">
        <div class="keep-all c-text-black gradient-text bg-purple-white light:bg-text-color17 whitespace-pre-line text-1.4rem leading-2.3rem mx-auto mb-1.7rem">
          {{$t('metamaskView.p1')}}
        </div>
        <div class="flex items-center bg-primaryBg
                    light:bg-colorF2 border-2 border-color62
                    py-1rem lg:px-6rem px-2rem font-bold
                    max-w-50rem mx-auto rounded-12px c-text-bold
                    text-1rem lg:leading-2rem leading-1.6rem mb-1rem">
          {{ account }}
          <i class="w-1.3rem h-1.3rem ml-1rem cursor-pointer icon-copy" @click="onCopy(account)"></i>
        </div>
        <template v-if="isRegister">
          <div class="flex items-start mb-2rem">
            <img class="mr-10px w-1.3rem xl:mt-3px" src="~@/assets/icon-warning-primary.svg" alt="">
            <div class="whitespace-pre-line text-left text-color8B light:text-color46 font-bold text-0.8rem leading-1.3rem"
                 style="word-break: break-word"
                 v-html="$t('metamaskView.p3', {account: `<strong class='text-color62 c-text-black'>@${username || 'Pipi'}</strong>`})">
            </div>
          </div>
          <button class="c-text-black w-full gradient-btn h-3.6rem max-h-65px px-2.5rem mx-auto rounded-full text-1rem mt-1.25rem"
                  @click="$emit('back')">
            {{$t('metamaskView.back')}}
          </button>
        </template>
        <template v-else>
          <div class="whitespace-pre-line mb-1rem text-color8B light:text-color7D text-left text-0.9rem lg:text-0.75rem leading-1.2rem">
            {{$t('metamaskView.p2')}}
          </div>
          <button class="c-text-black w-full gradient-btn h-3.6rem max-h-65px px-2.5rem mx-auto rounded-full text-1rem mt-1.25rem flex justify-center items-center"
                  @click="confirm"
                  :disabled="isCheckingAddress || isSigning">
            {{$t('metamaskView.confirm')}}
            <c-spinner class="w-1.5rem h-1.5rem ml-0.5rem" v-show="isCheckingAddress || isSigning"></c-spinner>
          </button>
          <button class="c-text-black bg-color84 light:bg-colorD6 light:text-white
                         w-full h-3.6rem max-h-65px px-2.5rem mx-auto rounded-full text-1rem mt-1.25rem"
                  @click="$emit('back')">
            {{$t('metamaskView.back')}}
          </button>
        </template>
      </div>
      <div v-if="step===2">
        <template v-if="authError">
          <div class="min-h-13rem">
            <img class="w-5rem h-5rem mx-auto" src="~@/assets/icon-error-red.svg" alt="">
            <div class="text-redColor text-center font-700 mt-1rem">Error!</div>
          </div>
          <button class="flex items-center justify-center c-text-black gradient-btn
                      h-3.6rem max-h-65px w-full rounded-full
                      w-full mb-2.3rem text-1rem mt-1.25rem"
                  @click="$emit('back')">
            {{$t('verifyView.back')}}
          </button>
        </template>
        <template v-else>
          <img class="w-5rem mx-auto mb-2rem" src="~@/assets/icon-record.svg" alt="">
          <div class="keep-all c-text-black gradient-text bg-purple-white light:bg-text-color17 whitespace-pre-line text-1.4rem leading-2.3rem mx-auto mb-2rem">
            {{$t('verifyView.p3')}}
          </div>
          <button class="flex items-center justify-center c-text-black gradient-btn gradient-btn-disabled-grey
                         h-3.6rem max-h-65px w-full rounded-full
                         w-full mb-2.3rem text-1rem mt-1.25rem"
                  :disabled="isSigningup"
                  @click="signup">
            {{isSigningup?$t('verifyView.verifying'):$t('verifyView.verify')}}
            <c-spinner class="w-1.5rem h-1.5rem ml-0.5rem" v-show="isSigningup"></c-spinner>
          </button>
        </template>
      </div>
      <div v-if="step===3">
        <img class="w-5rem h-5rem mx-auto mb-2rem" src="~@/assets/icon-success-login.svg" alt="">
        <div class="keep-all c-text-black gradient-text bg-purple-white light:bg-text-color17 whitespace-pre-line text-1.4rem leading-2.3rem mx-auto">
          {{$t('verifyView.p9')}}
        </div>
        <div class="keep-all gradient-text bg-purple-white light:bg-text-color17 whitespace-pre-line text-1.4rem leading-2.3rem mx-auto mb-2rem">
          {{$t('verifyView.p10')}}
        </div>
        <button class="flex items-center justify-center c-text-black gradient-btn
                      h-3.6rem max-h-65px w-full rounded-full
                      w-full text-1rem mt-1.25rem"
                @click="send">
          {{$t('verifyView.postBtn')}}
        </button>
        <button class="text-1rem text-color8B underline mt-1rem"
                @click="$emit('skip')">
          {{$t('verifyView.skip')}}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { onCopy } from "@/utils/tool";
import { getUserByEth, register, check } from '@/api/api'
import { mapState } from 'vuex'
import { accountChanged } from '@/utils/web3/account'
import { signMessage } from '@/utils/web3/web3'
import { SignUpMessage, SendPwdServerPubKey } from '@/config'
import { ethers } from 'ethers'
import { bytesToHex } from '@/utils/code'
import { generateSteemAuth } from '@/utils/steem'
import { box, createKeypair } from '@/utils/tweet-nacl'
import { notify } from "@/utils/notify";
import Cookie from 'vue-cookies'
import  { sleep } from '@/utils/helper'

export default {
  name: "MetaMaskAccount",
  props: {
    address: {
      type: String,
      default: ''
    },
    pair: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      isRegister: false,
      step: 1,
      isCheckingAddress: false,
      username: '',
      isSigning: false,
      isSigningup: false,
      pwd: '',
      sendPubKey: '',
      salt: "",
      authError: false,
      account: ''
    }
  },
  computed: {
    // ...mapState('web3', ['account']),
    ...mapState(['referee'])
  },
  watch: {
    account(newValue, oldValue) {
      if (!this.isCheckingAddress)
        this.checkoutAccount()
    }
  },
  methods: {
    onCopy,
    async send() {
      window.open('https://twitter.com/intent/tweet?text=I have linked my Twitter to @wormhole_3 to help myself take ownership of my data, see this: https://alpha.wormhole3.io%0a%23iweb3', '__blank')
      this.$emit('skip')
    },
    showNotify(message, duration, type) {
      notify({message, duration, type})
    },
    async confirm() {
      if(this.isRegister){
        this.$emit('back')
      }else {
        try{
          this.isSigning = true
          const sig = await signMessage(SignUpMessage, this.account)
          if (!sig) {
            this.showNotify(this.$t('tips.dismatchAddress'), 5000, 'error')
            return;
          }
          const salt = bytesToHex(ethers.utils.randomBytes(4))
          let pair = this.pair;
            await sleep(0.6);
          if (!pair.privateKey) {
            pair = await createKeypair();
          }
          const pwd = box(generateSteemAuth(sig.substring(2) + salt, this.account), SendPwdServerPubKey, pair.privateKey)
          this.pwd = pwd,
          this.salt = salt
          this.sendPubKey = pair.publicKey
          this.step = 2
        } catch (e) {
          console.log('sign message fail:', e);
        } finally {
          this.isSigning = false
        }
      }
    },
    async checkoutAccount() {
      try {
        this.isCheckingAddress = true
        const account = await getUserByEth(this.account);
        if (account && account.code === 3){
          // registred
          this.username = account.account.twitterUsername
          this.isRegister = true;
        }else {
          // not registred
          this.username = ''
          this.isRegister = false
        }

      } catch(e) {

      } finally {
        this.isCheckingAddress = false
      }
    },
    async signup() {
      console.log('signup');
      let loginInfo = Cookie.get('account-auth-info');
      Cookie.remove('account-auth-info');
      if (loginInfo) {
        try {
          this.isSigningup = true
          const { accessToken, twitterId } = loginInfo;
          let params = {
            accessToken,
            twitterId,
            referee: this.referee,
            sendPubKey: this.sendPubKey,
            pwd: this.pwd,
            ethAddress: this.account,
            isMetamask: 1,
            salt: this.salt
          }
          await register(params);
          // checkout register progress
          const res = await check({accessToken, twitterId})
          if (res && res.code === 3) {
            this.$store.commit('saveAccountInfo', res.account)
            // signup success
            this.step = 3;
          }
        }catch(e) {
          console.log(532, e);
        }finally {
          this.isSigningup = false
        }
      }else {
        // not authed
        this.showNotify(this.$t('signUpView.notAuth'), 5000, 'error')
        this.step = 0
        this.$emit('back');
        this.authError = true
      }
    }
  },
  async mounted () {
    this.account = this.address
    this.checkoutAccount();
    accountChanged(acc => {
      this.account = ethers.utils.getAddress(acc)
    })
  },
}
</script>

<style scoped lang="scss">
</style>
