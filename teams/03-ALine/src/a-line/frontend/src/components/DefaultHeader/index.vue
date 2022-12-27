<template>
  <div class="default-header h-[64px] bg-[#ccc] flex justify-between">
    <div>
      <img src="@/assets/images/logo.jpg" class="h-[28px] mt-[18px] mb-[18px] cursor-pointer" @click="goHome" />
    </div>
    <div>
      <a-button @click="changeLangZh" class="align-middle" :class="languageZhClick == 'true' ? 'changeZh' : 'changeEn'">
        中
      </a-button>
      <a-button @click="changeLangEn" class="align-middle mr-[32px]" :class="language == 'en' ? 'langEn' : 'langZh'">EN
      </a-button>
      <img src="@/assets/icons/fill.svg" class="mt-[16px] mb-[16px] mr-[32px]" />
      <img src="@/assets/icons/git.svg" class="mt-[16px] mb-[16px]" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const language = window.localStorage.getItem("language") || 'en';
const languageZhClick = window.localStorage.getItem("languageZhClick")

const router = useRouter();
const goHome = () => {
  router.push("/pipeline");
};

const changeLangZh = () => {
  window.localStorage.setItem("language", "zh");
  window.localStorage.setItem("languageZhClick", 'true');
  location.reload();
}
const changeLangEn = () => {
  window.localStorage.setItem("language", "en");
  window.localStorage.setItem("languageZhClick", 'false');
  location.reload();
}

</script>

<style lang="less" scoped>
.default-header {
  position: fixed;
  top: 0;
  padding: 0 32px;
  width: 100%;
  height: 64px;
  background-color: #ffffff;
  border: 1px solid #f8f8f8;
  z-index: 1;
}

.ant-btn {
  width: 40px;
  height: 32px;
  font-size: 16px;
  padding: 0;

  &:hover,
  &:focus {
    color: #fff;
    border-color: #28c57c;
  }
}

.changeZh {
  background: #28c57c;
  color: white;
  border-radius: 6px 0px 0px 6px;
}

.changeEn {
  background: white;
  color: #BCBEBC;
  border-radius: 6px 0px 0px 6px;
}

.changeEn:hover {
  background: white;
  color: #BCBEBC !important;
}
.changeZh:hover{
  color: white;
}

.langZh {
  // width: 40px;
  // height: 32px;
  // font-size: 16px;
  // padding: 0px;
  background: white;
  color: #BCBEBC;
  border-radius: 0px 6px 6px 0px;
}

.langEn {
  // width: 40px;
  // height: 32px;
  // font-size: 16px;
  // padding: 0px;
  background: #28c57c;
  color: white;
  border-radius: 0px 6px 6px 0px;
}

.langZh:hover {
  background: white;
  color: #BCBEBC !important;
}
.langEn:hover{
  color: white !important;
}

</style>
