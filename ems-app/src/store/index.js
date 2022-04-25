import axios from 'axios'
import { createStore } from 'vuex'

export default createStore({
  state: {
    admin: {
      id: null,
      adminId: '',
      email: '',
      name: '',
      perms: ''
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.admin.id
    },
    currentAdmin(state) {
      return state.admin
    },
    isAdmin(state) {
      return state.admin.perms == '관리자'
    },
    getAdminId(state) {
      return state.admin.adminId
    },
    getAdminName(state) {
      return state.admin.name
    }
  },
  mutations: {
    CURRENT_ADMIN_FETCHED(state, admin) {
      console.log('CURRENT_ADMIN_FETCHED', admin)
      state.admin.id = admin.id
      state.admin.adminId = admin.adminId
      state.admin.email = admin.email
      state.admin.name = admin.name
      state.admin.perms = admin.perms
    },
    CURRENT_ADMIN_REMOVED(state) {
      //console.log('CURRENT_ADMIN_REMOVED')
      state.admin.id = null
      state.admin.adminId = ''
      state.admin.email = ''
      state.admin.name = ''
      state.admin.perms = ''
    },
  },
  actions: {
    async initialLoad(context) {
      if (localStorage.authToken) {
        console.log('check current admin with token:', localStorage.authToken)
        axios.defaults.headers.common.Authorization = `Bearer ${localStorage.authToken}`
        try {
          const response = await axios.get("/v1/auth/admin-current")
        //console.log('response:', JSON.stringify(response.data))
          context.commit("CURRENT_ADMIN_FETCHED", response.data)
        } catch (e) {
          console.log('error getting "/v1/auth/admin-current":', e.message)
          axios.defaults.headers.common.Authorization = ''
        }
      } else {
        /*
        var admin = {}
        admin.id = 1
        admin.email = 'admin@test.com'
        admin.name = 'test'
        context.commit("CURRENT_ADMIN_FETCHED", admin)
        */
      }
    },

    async login(context, idPassword) {
      //console.log(`idPassword=${idPassword}`)
      try {
        const response = await axios.post("/v1/auth/admin-login", idPassword)
        let admin = response.data.result
        let token = response.data.token
        localStorage.setItem('authToken', token)
        //console.log('jwt:', token)
        axios.defaults.headers.common.Authorization = `Bearer ${token}`
        context.commit("CURRENT_ADMIN_FETCHED", admin)
      } catch (ex) {
        let msg = ex.response ? ex.response.data.result : ex.message
        throw msg
      }
    },

    async logout(context) {
      delete axios.defaults.headers.common.Authorization
      localStorage.removeItem('authToken')
      context.commit("CURRENT_ADMIN_REMOVED")
    },

  },
  modules: {
  }
})
