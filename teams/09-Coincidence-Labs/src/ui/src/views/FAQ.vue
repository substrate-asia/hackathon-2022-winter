<template>
  <div class="faq-view overflow-auto">
    <div class="c-text-black text-center py-1rem text-1.5rem md:text-1.2rem">{{$t('faq')}}</div>
    <div class="container mx-auto text-left max-w-43rem fade-in c-text-medium">
      <div class="bg-blockBg light:bg-white light:shadow-popper-tip rounded-12px py-1rem px-1.5rem mb-1rem">
        <div class="c-text-black text-1.15rem leading-2rem md:text-1rem md:leading-1.5rem">
          {{$t('faqView.q1')}}
        </div>
        <div class="text-1rem leading-2rem md:text-0.8rem md:leading-1.2rem mt-1rem text-color8B">
          {{$t('faqView.a1')}}
        </div>
      </div>
      <div class="bg-blockBg light:bg-white light:shadow-popper-tip rounded-12px py-1rem px-1.5rem mb-1rem">
        <div class="c-text-black text-1.15rem leading-2rem md:text-1rem md:leading-1.5rem">
          {{$t('faqView.q2')}}
        </div>
        <div class="text-1rem leading-2rem md:text-0.8rem md:leading-1.2rem mt-1rem text-color8B">
          {{$t('faqView.a2')}}
        </div>
      </div>
      <div class="bg-blockBg light:bg-white light:shadow-popper-tip rounded-12px py-1rem px-1.5rem mb-1rem">
        <div class="c-text-black text-1.15rem leading-2rem md:text-1rem md:leading-1.5rem">
          {{$t('faqView.q3')}}
        </div>
        <div class="text-1rem leading-2rem md:text-0.8rem md:leading-1.2rem mt-1rem text-color8B">
          {{$t('faqView.a3p1')}}<br>
          {{$t('faqView.a3p2')}}<br>
          {{$t('faqView.a3p3')}}
        </div>
      </div>
      <div class="bg-blockBg light:bg-white light:shadow-popper-tip rounded-12px py-1rem px-1.5rem mb-1rem">
        <div class="c-text-black text-1.15rem leading-2rem md:text-1rem md:leading-1.5rem">
          {{$t('faqView.q4')}}
        </div>
        <div class="text-1rem leading-2rem md:text-0.8rem md:leading-1.2rem mt-1rem text-color8B">
          {{$t('faqView.a4p1')}}<br>
          {{$t('faqView.a4p2')}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FAQ"
}
</script>

<style scoped>

</style>
