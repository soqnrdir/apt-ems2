<template>
</template>

<script>
import { mapActions } from "vuex"

export default {
  methods: {
    ...mapActions(["logout"]),
  },
  async mounted() {
    this.$emit('setloading', true)
    await this.logout()
    this.$emit('resetloading', false)
    this.$router.replace('/login')
  },
}
</script>
