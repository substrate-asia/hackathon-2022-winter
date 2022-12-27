<template>
    <div class="faq-view overflow-auto">
      <div class="c-text-black text-center py-1rem text-1.5rem md:text-1.2rem">Give me test token</div>
      <div class="container mx-auto text-left max-w-43rem fade-in c-text-medium">
        <div class="bg-blockBg rounded-12px py-1rem px-1.5rem mb-1rem">
          <div class="c-text-black text-1.15rem leading-2rem md:text-1rem md:leading-1.5rem">
            Test-USDT
          </div>
          <div class="text-1rem leading-2rem md:text-0.8rem md:leading-1.2rem mt-1rem">
            <div class="w-full sm:w-4/7 border-1 bg-black border-1 border-color8B/30 rounded-12px h-40px 2xl:h-2rem">
                <input class="bg-transparent h-full w-full px-0.5rem"
                        v-model="token"
                        type="text" :placeholder="$t('curation.inputErc20')">
            </div>
            <div class="mt-1.8rem flex justify-between text-15px">
                <button class="h-40px 2xl:h-2rem rounded-full px-1.5rem gradient-btn"
                        @click="get" :disable="loading">
                        <c-spinner class="w-1.5rem h-1.5rem ml-0.5rem" v-show="loading"></c-spinner>
                        {{$t('common.confirm')}}
                    </button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script>
import { getFaucet } from '@/api/api'
import { ethers } from 'ethers'
import { notify } from '@/utils/notify'

export default {
    name: "AboutUs",
    data() {
        return {
            token: 'Input your address',
            loading: false
        }
    },
    methods: {
        async get() {
            if (!ethers.utils.isAddress(this.token)) {
                notify({message: 'Wrong address', type:'error'})
                return;
            }
            try {
                this.loading = true;
                const hash = await getFaucet(this.token)
                notify({message: 'Success'})
            }catch(e) {
                notify({message: 'Err, please try later', type:'error'})
            }finally {
                this.loading = false;
            }
        }
    },
}
</script>
  
<style scoped>
  
</style>
  