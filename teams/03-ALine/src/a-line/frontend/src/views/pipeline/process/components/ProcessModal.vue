<template>
  <a-modal v-model:visible="visible" :closable="false" :footer="null" ref="modal" :keyboard="false"
    style="top: 0px; margin-right: 0px; padding: 0px" width="800px">
    <div class="px-[24px]">
      <div class="flex justify-between">
        <span class="text-[24px] text-[#000000] font-semibold mb-[28px]">{{
            stagesData.title
        }}</span>
        <span class="text-[#28C57C] cursor-pointer pt-[6px]" @click="toggle">
          <img src="@/assets/icons/full.svg" class="w-[18px] mr-[10px]" />
          <span class="align-middle"> {{ $t("log.full") }}</span>
        </span>
      </div>
      <div ref="root">
        <div class="fullscreen-wrapper rounded-[22px] p-[24px]" :class="fullscreen ? 'fullStyle' : ''"
          ref="fullscreenWrapper">
          <div v-if="fullscreen" @click="toggle" class="text-right cursor-pointer pb-[12px]"
            :class="fullscreen ? 'resetoreFixed' : ''">
            <img src="@/assets/icons/flod.svg" class="w-[18px] mr-[10px]" />
            <span class="text-[#ffffff] align-middle">{{
                $t("log.restore")
            }}</span>
          </div>

          <div class="main text-white bg-black bg-[#000000] break-all pt-[30px]" :style="{
            height: bodyHeight,
          }">
            <div ref="scrollDom" class="scrollDom pb-[24px]">
              <div class="" v-for="(it, idx) in stagesData.content" :key="idx">{{ it }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { ref, defineComponent, toRefs, reactive, onMounted, nextTick, watch } from "vue";
import { api as fullscreen } from "vue-fullscreen";
export default defineComponent({
  props: {
    stagesData: { type: Object, default: () => { return {} } }
  },
  setup(props, context) {
    const root = ref();
    const fullscreenWrapper = ref()
    const scrollDom = ref()
    const state = reactive({
      fullscreen: false,
      teleport: true,
      visible: false,
      bodyHeight: document.body.clientHeight - 162 + "px",
    });

    async function toggle() {
      await fullscreen.toggle(root.value.querySelector(".fullscreen-wrapper"), {
        teleport: state.teleport,
        pageOnly: true,
        callback: (isFullscreen) => {
          state.fullscreen = isFullscreen;
          fullscreenWrapper.value.scrollTop = scrollDom.value.scrollHeight
        },
      });
      state.fullscreen = fullscreen.isFullscreen;

    }

    const showVisible = () => {
      state.visible = true;
      nextTick(() => {
        fullscreenWrapper.value.scrollTop = scrollDom.value.scrollHeight
      })
    };

    watch(() => props.stagesData.content,
      (oldV, newV) => {
        if (newV && scrollDom.value) {
          nextTick(() => {
            // console.log(scrollDom.value, '00000')
            fullscreenWrapper.value.scrollTop = scrollDom.value.scrollHeight
          })
        }
      }, { deep: true, immediate: false })

    return {
      root,
      fullscreenWrapper,
      scrollDom,
      ...toRefs(state),
      ...toRefs(props),
      toggle,
      showVisible,
    };
  },
});
</script>
<style lang="less" scoped>
.fullscreen-wrapper {
  z-index: 999999;
  background-color: #000;
  overflow-x: hidden;
  overflow-y: auto;
}

.resetoreFixed {
  width: 100%;
  position: fixed;
  padding-top: 12px;
  top: 0px;
  right: 42px;
  z-index: 9;
  background-color: #000;
}

.ant-modal-body {
  padding: 0px !important;
}

.fullStyle {
  border-radius: 0;
}
</style>
