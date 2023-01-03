<template>
  <div class="faq-view overflow-auto">
    <div class="c-text-black text-center py-1rem text-1.5rem md:text-1.2rem">About us</div>
    <div class="container mx-auto text-left max-w-43rem fade-in c-text-medium">
      <div class="bg-blockBg light:bg-white light:shadow-popper-tip rounded-12px py-1rem px-1.5rem mb-1rem">
        <div class="c-text-black text-1.15rem leading-2rem md:text-1rem md:leading-1.5rem">
          {{$t('aboutView.q1')}}
        </div>
        <div class="text-1rem leading-2rem md:text-0.8rem md:leading-1.2rem mt-1rem text-color8B">
          {{$t('aboutView.a1')}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutUs"
}
</script>

<style scoped>

</style>
