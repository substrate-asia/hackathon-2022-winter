<template>
  <slot :identity="identity"></slot>
</template>

<script>
export default {
  props: {
    address: {
      type: String,
    },
  },
  data() {
    return {
      identity: {},
    };
  },
  created() {
    this.updateIdentity();
  },
  watch: {
    address(newValue, oldValue) {
      if (newValue != oldValue) {
        this.updateIdentity();
      }
    },
  },
  methods: {
    updateIdentity() {
      this.identity = {
        showMoreInfo: false,
        display: "",
        legal: "",
        web: "",
        email: "",
        twitter: "",
        accountPublicKey: "",
        subOf: "",
        judgement: "",
      };
      let promise = this.$utils.loadAddressIdentityAsync(this.address);
      promise.then((info) => {
        Object.assign(this.identity, info.identity);
      });
    },
  },
};
</script>

<style lang="less" scoped>
</style>
