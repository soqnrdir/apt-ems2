<template>
<div class="container d-flex justify-content-center align-items-center" style="height:600px">
  <div class="card col-4 mt-5 text-start p-2 rounded">
    <div>
      <div class="card-header d-flex justify-content-evenly">
        <img style="width:60%" src="../img/mainLogo.png">
        <h5 class="card-title fw-bold mt-3 fs-2">로그인</h5>
      </div>
      <div class="card-body">
        <form @submit="onSubmit">
          <div class="mb-3">
              <label for="adminId-text" class="col-form-label fw-bold ms-1">아이디</label>
              <input type="text" ref="autofocus" class="form-control" id="adminId-text" v-model="form.adminId" style="border-top:0px;border-left:0px;border-right:0px" placeholder="아이디를 입력해주세요" required autocomplete="off">
          </div>
          <div class="mb-5">
            <label for="password-text" class="col-form-label fw-bold ms-1">비밀번호</label>
            <input type="password" class="form-control" id="password-text" v-model="form.password" style="border-top:0px;border-left:0px;border-right:0px" placeholder="비밀번호를 입력해주세요" autocomplete="off">
            <!-- <div class="d-flex justify-content-between mt-2 ms-1">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" @click="pwCheck" id="flexCheckDefault">
                <label class="form-check-label" for="flexCheckDefault">
                    아이디 저장
                </label>
              </div>
              <div class="fw-bold">
                <button type="button" class="border-0 bg-white" style="flex-basis:80px;" >아이디 찾기</button> /
                <button type="button" class="border-0 bg-white" style="flex-basis:80px;" >비밀번호 찾기</button>
              </div>
            </div> -->
          </div>
          <div>
             <button type="submit" @click="clickSubmit" class="btn btn-dark col-12">
             로그인
          </button>
          </div>
        </form>
      </div>
      <div class="card-body text-center fw-bold text-white" :class="errorBg">
        {{error}}
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapActions } from "vuex"
import { ref } from 'vue'

export default {
  data () {
    return {
      form: {
        adminId: '',
        password: ''
      },
      error: '',
      errorBg: 'bg-white'
    }
  },
  mounted () {
    this.$refs.autofocus.focus()
  },
  methods: {
    ...mapActions(["login"]),
    onSubmit (evt) {
      evt.preventDefault()
      //if(this.form.adminId !== '' || this.form.adminId !== null) {
        this.handleLogin(this.form.adminId, this.form.password)
      //}
    },
    clickSubmit() {
      this.errorBg = 'bg-white'
      this.error = ''
    },
    async handleLogin(adminId, password) {
      this.isDisabled = true
      try {
        await this.login({adminId: adminId, password: password})
        if (this.$route.params.nextUrl) {
          this.$router.push(this.$route.params.nextUrl)
        }
        else {
          //let admin = this.$store.getters.currentAdmin
          let admin = this.$store.state.admin
          if(admin.admin) {
            // admin 사용자인 경우 경로를 다르게 하는 경우에 사용
            this.$router.push('/home')
          }
          else {
            this.$router.push('/home')
          }
        }
      } catch (ex) {
        this.$emit('loadingOff')
        this.error = ex
        this.errorBg = 'bg-danger'
      }
      this.isDisabled = false
    //   try {
    //     const response = await this.axios.post("/v1/auth/admin-login", { adminId: adminId, password: password})
    //     let admin = response.data.result
    //     let token = response.data.token
    //     localStorage.setItem('authToken', token)
    //     // this.axios.defaultsm.headers.common.Authorization = `Bearer ${token}`
    //     console.log('admin', admin)
    //     this.$router.push('/home')
        
    //     // context.commit("CURRENT_ADMIN_FETCHED", admin)
    //   } catch (ex) {
    //     let msg = ex.response ? ex.response.data.result : ex.message
    //     this.errorBg = 'bg-danger'
    //     this.error = msg
    //     throw msg
    //   }
    // }
    }
  }
}
</script>
