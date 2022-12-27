<template>
    <div>
        {{info}}
    </div>
</template>

<script>
import Cookie from 'vue-cookies'

export default {
  name: "LoginCode",
  data() {
    return {
        info: ''
    }
  },
  mounted () {
    const code = this.$route.params.code;
    
    if (code) {
        this.info = 'Login Success'
        // Cookie.set('twitter-loginCode', code, '300s');
        window.close();
    }else {
        // login fail
        // Cookie.set('twitter-loginCode', 'fail', '300s');
        window.close();
    };
    this.info = 'Login Success, please close this window'
  },
  beforeDestroy () {
    if (this.info.length === 0) {
      // Cookie.set('twitter-loginCode', 'fail', '300s');
    }
  },
}
</script>

<style lang="scss" scoped>

</style>