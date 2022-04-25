<template>
  <div id="nav">
    <navbar />
  </div>
  <router-view />
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import { mapActions, mapState } from "vuex"

export default {
  name: 'Home',
  components: {
    Navbar
  },

  data() {
    return {
      loading: true,
      error: false,
      errorMessage: ''
    }
  },
  computed: {
    ...mapState([
      'admin'
    ])
  },
  methods: {
    ...mapActions(['initialLoad', 'logout']),

    goLoginPage() {
      this.$router.push('/login')
    }
  },
  
  async created() {
    console.log('App created')
    try {
      await this.initialLoad()
      this.loading = false
    } catch (error) {
      console.log('initialLoad error: ', error)
      this.logout()
      this.loading = false
      this.error = true
      this.errorMessage = error
    }
  }

}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
