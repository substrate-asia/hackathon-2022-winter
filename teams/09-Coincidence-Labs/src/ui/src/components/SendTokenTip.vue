<template>
  <div class="pt-2rem pb-3rem sm:pt-1rem sm:pb-1rem">
    <div class="c-text-black text-1.6rem">{{$t('curation.create')}}</div>
    <div class="text-15px leading-1.5rem text-left xl:text-0.75rem text-color8B light:text-color7D my-1.5rem">
      <slot name="desc">
        {{$t('curation.createTip', {rewards:  this.amount + ' ' + this.token.symbol})}}
      </slot>
    </div>
    <button v-if="!approvement"
            class="gradient-btn w-full h-55px 2xl:h-2.8rem max-w-300px rounded-full
                   c-text-black text-18px 2xl:text-0.9rem flex items-center justify-center mx-auto"
            @click="approve"
          :disabled="approving">
      <c-spinner class="w-1.5rem h-1.5rem ml-0.5rem" v-show="approving"></c-spinner>
      <span>{{$t('common.approve')}}</span>
    </button>
    <button v-else
            class="gradient-btn w-full h-44px 2xl:h-2.2rem max-w-300px rounded-full
                   c-text-black text-18px 2xl:text-0.9rem flex items-center justify-center mx-auto"
      :disabled="creating"
      @click="creating=true;$emit('create')">
      <span>{{$t('common.confirm')}}</span>
      <c-spinner class="w-1.5rem h-1.5rem ml-0.5rem" v-show="creating"></c-spinner>
    </button>
    <div class="w-full text-center">
      <button class="underline mt-1.5rem c-text-black text-15px 2xl:text-0.75rem"
              :disable="creating || approving"
              @click="creating=false;approving=fals;$emit('close')">{{$t('curation.backToEdit')}}</button>
    </div>
  </div>
</template>

<script>
import  {getApprovement, approve} from '@/utils/asset'
import { EVM_CHAINS } from '@/config'
import { notify } from "@/utils/notify";

export default {
  name: "SendTokenTip",
  props: {
    chainName: {
      type: String
    },
    address: {
      type: String
    },
    token: {
      type: Object,
      default: {}
    },
    amount: {
      type: Number,
      default: 0
    },
    approveContract: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tokenInfo: '',
      approvement: false,
      approving: false,
      creating: false
    }
  },
  methods: {
    async approve() {
      try{
        this.approving = true
        const res = await approve(this.token.address, this.address, this.approveContract)
        this.approvement = res
      } catch (e) {
        notify({message: this.$t('curation.approveFail'), duration: 5000, type: 'error'})
      } finally {
        this.approving = false
      }
    }
  },
  mounted () {
    if (!this.chainName) {
      this.$emit('close')
    }
    this.tokenInfo = this.amount + ' ' + this.token.symbol;

    getApprovement(this.chainName, this.token.address, this.address, this.approveContract).then(res => {
      this.approvement = parseFloat(res) >= parseFloat(this.amount)
    }).catch(e=>{
      console.log('get approve fail:',e);
    })
  },
}
</script>

<style scoped>

</style>
