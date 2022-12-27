<template>
  <div>
    <div class="c-text-black text-1.6rem">
      Confirm Reward
    </div>
    <div class="text-15px leading-1.5rem xl:text-0.75rem text-color8B light:text-color7D my-1.5rem">
      After the Quest ends, eligible questers will be able to claim the rewards.
    </div>
    <button class="gradient-btn w-full h-55px 2xl:h-2.8rem max-w-300px rounded-full
                   flex justify-center items-center mx-auto
                   c-text-black text-18px 2xl:text-0.9rem"
            @click="$emit('onConnect')">
      <img class="w-32px mr-1rem" src="~@/assets/icon-metamask.png" alt="">
      <span>Confirm Reward</span>
    </button>
    <div class="underline mt-1.5rem c-text-black text-15px 2xl:text-0.75rem cursor-pointer"
         @click="$emit('close')">Cancel</div>
  </div>
</template>

<script>
export default {
  name: "ConfirmRewardTip"
}
</script>

<style scoped>

</style>
