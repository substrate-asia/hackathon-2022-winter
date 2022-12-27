<template>
  <div class="w-full h-full overflow-auto">
    <div class="mx-auto text-white light:text-blueDark">
      <div v-if="step===1">
        <template v-if="!showSaveKey">
          <div class="keep-all c-text-black gradient-text bg-purple-white light:bg-text-color17 whitespace-pre-line text-1.4rem leading-2.3rem mx-auto mb-1rem">
            {{$t('verifyView.p1')}}
          </div>
          <div class="flex items-center bg-inputBg border-2 border-color62
                    light:bg-colorF2
                    py-0.5rem px-1rem lg:px-2rem rounded-12px c-text-black
                    text-1rem lg:leading-2rem leading-1.6rem mb-0.8rem"
               style="word-spacing: 1rem; word-break: break-word">
            <div class="flex-1 grid grid-cols-4 gap-x-0.5rem" v-if="wallet && wallet.nemonic">
              <span class="col-span-1 text-left" v-for="(word, i) of wallet.nemonic.split(' ')" :key="i">{{word}}</span>
            </div>
            <img class="w-1.3rem h-1.3rem ml-1rem cursor-pointer"
                 @click="onCopy(wallet.nemonic)"
                 src="~@/assets/icon-copy-primary.svg" alt="">
          </div>
          <div class="max-w keep-all text-left text-0.9rem lg:text-0.75rem leading-1.2rem text-color8B light:text-color6F">
            {{$t('verifyView.p2')}}
          </div>
          <button class="c-text-black gradient-btn h-3.6rem max-h-65px w-full rounded-full text-1rem mt-1.25rem"
                  @click="showSaveKey=true">
            {{$t('verifyView.saveBtn')}}
          </button>
        </template>
        <template v-else>
          <div class="keep-all c-text-black gradient-text bg-purple-white light:bg-text-color17 whitespace-pre-line text-1.4rem leading-2.3rem mx-auto mb-1rem">
            {{$t('verifyView.p7')}}
          </div>
          <div class="key-box flex items-center border-2 border-color84/30
                    light:bg-gradient-input light:text-white light:border-color62
                    py-0.5rem px-2rem rounded-12px c-text-black
                    text-1rem lg:leading-2rem leading-1.6rem mb-0.8rem"
               style="word-spacing: 1rem; word-break: break-word">
            <div class="flex-1 grid grid-cols-4 gap-x-0.5rem" v-if="wallet && wallet.nemonic">
              <span class="col-span-1 text-left" v-for="(word, i) of wallet.nemonic.split(' ')" :key="i">{{word}}</span>
            </div>
            <img class="w-1.3rem h-1.3rem ml-1rem cursor-pointer"
                 @click="onCopy(wallet.nemonic)"
                 src="~@/assets/icon-copy.svg" alt="">
          </div>
          <div class="flex justify-center items-start mx-auto">
            <el-checkbox v-model="checked"  class="c-checkbox z-0"/>
            <div class="flex-1 text-0.9rem leading-1.2rem text-color8B light:text-blueDark text-left ml-8px" style="word-break: break-word">
              {{$t('verifyView.p8')}}
            </div>
          </div>
          <div class="py-1.6rem rounded-b-12px flex justify-center items-center">
            <button class="c-text-black gradient-btn h-3.6rem max-h-65px w-full rounded-full text-1rem flex justify-center items-center"
                  :disabled="!checked"  
                  @click="step=2">
              {{$t('verifyView.sureBtn')}}
            </button>
          </div>
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
      <div class="flex justify-center mt-1.5rem">
        <span class="w-10px h-10px block rounded-full mx-10px"
              :class="step>=i?'bg-color62':'bg-color84/30'"
              v-for="i of [1, 2, 3]" :key="i"></span>
      </div>
    </div>
  </div>
</template>

<script>
import { register, check } from '@/api/api'
import { randomWallet } from '@/utils/ethers'
import { box, createKeypair } from '@/utils/tweet-nacl'
import { SendPwdServerPubKey } from '@/config'
import { notify } from "@/utils/notify";
import { onCopy } from "@/utils/tool";
import { generateSteemAuth } from '@/utils/steem'
import Cookie from 'vue-cookies'
import { mapState } from 'vuex'
import { sleep } from '@/utils/helper'

export default {
  name: "CreateAccount",
  props: {
    wallet: {
      type: Object,
      default: {}
    },
    pair: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      checked: false,
      step: 1,
      showSaveKey: false,
      isSigningup: false,
      authError: false
    }
  },
  computed: {
    ...mapState(['referee'])
  },
  methods: {
    onCopy,
    showNotify(message, duration, type) {
        notify({message, duration, type})
    },
    async signup() {
      console.log('signup');
      this.isSigningup = true
      let loginInfo = Cookie.get('account-auth-info');
      Cookie.remove('account-auth-info');
      if (loginInfo) {
        try {
          let pair = this.pair
          await sleep(0.6);
          if (!pair && !pair.privateKey) {
            pair = await createKeypair();
          }
          const pwd = box(generateSteemAuth(this.wallet.privateKey), SendPwdServerPubKey, pair.privateKey)
          const { accessToken, twitterId } = loginInfo;
          let params = {
            accessToken,
            twitterId,
            referee: this.referee,
            sendPubKey: pair.publicKey,
            pwd,
            ethAddress: this.wallet.address,
            isMetamask: 0
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
        // this.showNotify(this.$t('signUpView.notAuth'), 5000, 'error')
        // this.step = 0
        // this.$emit('back');
        this.authError = true
      }
    },
    send() {
      // go to send twitter
      window.open('https://twitter.com/intent/tweet?text=I have linked my Twitter to @wormhole_3 to help myself take ownership of my data, see this: https://alpha.wormhole3.io%0a%23iweb3', '__blank')
      this.$emit('skip')
    }
  },
  async mounted () {
    if (!this.wallet && !this.wallet.address) {
      await sleep(0.6);
      randomWallet().then(wallet => this.wallet = wallet)
    }
  },
}
</script>

<style scoped lang="scss">
.tip-block {
  background-image: linear-gradient(to right, var(--gradient-primary-color1), var(--gradient-primary-color2));
}
.keep-all {
  word-break: keep-all;
}
.key-box {
  background: linear-gradient(94.28deg, rgba(129, 45, 226, 0.3) 0%, rgba(58, 73, 249, 0.3) 100%);
}
</style>
