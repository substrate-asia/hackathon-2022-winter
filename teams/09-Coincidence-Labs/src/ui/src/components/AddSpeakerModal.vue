<template>
  <div class="text-left min-h-330px relative flex flex-col">
    <button class="absolute right-20px top-20px"
            @click="$emit('close')">
      <i class="w-18px h-18px 2xl:w-1rem 2xl:h-1rem icon-close"></i>
    </button>
    <div class="flex-1">
      <div class="c-text-black mt-50px xl:mt-2rem mb-2rem text-20px 2xl:text-1rem">{{$t('curation.'+speakerType)}}</div>
      <div class="flex items-start">
        <img v-if="formData.avatar"
             class="w-54px h-54px rounded-27px"
             :src="formData.avatar" alt="">
        <div v-else class="w-54px h-54px xl:w-2.8rem xl:h-2.8rem bg-colorE3 rounded-full"></div>
        <div class="flex-1 ml-10px h-54px xl:h-2.8rem flex flex-col justify-between">
          <div v-if="formData.name">{{formData.name}}</div>
          <div v-else></div>
          <div class="bg-black border-1 border-color8B/30
                      light:bg-colorF2 light:border-colorE3 hover:border-primaryColor
                      rounded-full h-34px 2xl:h-2rem flex items-center relative"
               :class="isChecking?'hover:border-color8B/30':''">
            <input class="bg-transparent h-full w-full px-0.5rem"
                   v-model="formData.username"
                   :disabled="isChecking"
                   @input="checkedUser = false;formData.avatar = null;formData.name = ''"
                   placeholder="@username">
            <button class="font-bold mx-10px whitespace-nowrap"
                    :disabled="isChecking"
                    @click="checkUser">
              <span class="gradient-text gradient-text-right" v-if="!isChecking">{{$t('curation.verify')}}</span>
              <c-spinner v-else class="w-1.5rem h-1.5rem ml-0.5rem" color="#6246EA"></c-spinner>
            </button>
          </div>
        </div>
      </div>
    </div>
    <button class="gradient-btn gradient-btn-disabled-grey
                       h-44px 2xl:h-2.2rem w-full rounded-full text-16px 2xl:text-0.8rem"
            :disabled="loading"
            @click="confirm">
      <span>{{$t('common.confirm')}}</span>
      <c-spinner v-show="loading" class="w-1.5rem h-1.5rem ml-0.5rem"></c-spinner>
    </button>
  </div>
</template>

<script>
import { getUserInfoByUserId } from '@/utils/twitter'
import { notify } from '@/utils/notify'

export default {
  name: "AddSpeakerModal",
  props: {
    speakerType: {
      type: String,
      default: 'host'
    },
  },
  data() {
    return {
      formData: {
        avatar: '',
        name: '',
        username: ''
      },
      isChecking: false,
      checkedUser: false,
      loading: false
    }
  },
  methods: {
    async checkUser() {
      if (!this.formData.username) {
        return;
      }
      const usernameRex = '^@?[0-9a-zA-Z\_]+$'
      const match = this.formData.username.match(usernameRex)
      if (match) {
        try{
          this.isChecking = true
          const user = await getUserInfoByUserId(this.formData.username);
          if (user.data) {
            this.formData = {
              id: user.data.id,
              avatar: user.data.profile_image_url.replace('normal', '200x200'),
              name: user.data.name,
              username: user.data.username
            }
            this.checkedUser = true;
          }else {
            notify({message: this.$t('tips.userNotExist'), duration: 3000, type: 'info'})
          }
        } catch (e) {
          if (e === 'log out') {
            this.$router.replace('/square')
          }
        } finally {
          this.isChecking = false
        }
      }
    },
    confirm() {
      if (this.checkedUser) {
        this.$emit('confirm', this.formData)
      }else {
        this.$emit('confirm')
      }
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
