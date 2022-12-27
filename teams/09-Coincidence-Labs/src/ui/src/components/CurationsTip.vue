<template>
  <div>
    <div class="c-text-black text-1.6rem">Tips</div>
    <div class="text-15px leading-1.5rem text-left xl:text-0.75rem text-color8B light:text-color7D my-1.5rem">
      Only one curation can be created at a time, you need to deal with the draft first.
    </div>
    <button class="gradient-btn w-full h-55px 2xl:h-2.8rem rounded-full c-text-black text-18px 2xl:text-0.9rem"
            @click="$emit('confirm')">
      Edit Draft
    </button>
    <div class="underline mt-1.5rem c-text-black text-15px 2xl:text-0.75rem"
         @click="$emit('close')">Cancel Create</div>
  </div>
</template>

<script>
export default {
  name: "CurationsTip"
}
</script>

<style scoped>

</style>
