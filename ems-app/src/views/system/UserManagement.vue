<template>
<div class="p-3" @mousedown="closeToast">
  <div class="row">
    <div class="col-md-12">
      <h5 class="fw-bold text-start">사용자 관리</h5>
      <div class="card mt-4">
        <div class="card-body">
          <div class="row">
            <div class="text-end">
              <button v-if="isAdmin()" type="button" class="btn btn-info btn-fill text-white" data-bs-toggle="modal" data-bs-target="#userUpdateModal" @click="userPopR">
                사용자등록
              </button>
            </div>
          </div>
          <div class="row mt-3">
            <table class="table">
              <thead>
                  <tr>
                  <th v-for="column in userList.columns" :key="column">{{column}}</th>
                  </tr>
              </thead>
              <tbody v-if="userList.data.length != 0">
                <tr v-for="(item, index) in paginatedData" :key="index" >
                  <td>{{item.adminId}}</td>
                  <td style="color:#00BFFF;cursor:pointer" data-bs-toggle="modal" data-bs-target="#userUpdateModal" @click="userPopU(item)">{{item.name}}</td>
                  <td>{{item.division}}</td>
                  <td>{{item.phone}}</td>
                  <td>{{item.at}}</td>
                  <td>{{item.lastLogin}}</td>
                  <td>{{item.perms}}</td>
                </tr>
              </tbody>
              <tbody v-if="userList.data.length == 0">
                <tr>
                  <td colspan="8">데이터가 존재하지 않습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="row" v-if="userList.data.length != 0">
            <nav aria-label="Page navigation example" class="d-flex flex-row-reverse bd-highlight">
              <ul class="pagination">
                <li class="page-item">
                  <a class="page-link" href="#" @click="prevPage" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li class="page-item" :class="activeOn1" @click="activeSet(pageDefaultNum1)"><a class="page-link" href="#">{{pageDefaultNum1}}</a></li>
                <li v-if="userList.data.length > pageDefaultNum1 * 10" class="page-item" :class="activeOn2" @click="activeSet(pageDefaultNum2)"><a class="page-link" href="#">{{pageDefaultNum2}}</a></li>
                <li v-if="userList.data.length > pageDefaultNum2 * 10" class="page-item" :class="activeOn3" @click="activeSet(pageDefaultNum3)"><a class="page-link" href="#">{{pageDefaultNum3}}</a></li>
                <li v-if="userList.data.length > pageDefaultNum3 * 10" class="page-item" :class="activeOn4" @click="activeSet(pageDefaultNum4)"><a class="page-link" href="#">{{pageDefaultNum4}}</a></li>
                <li v-if="userList.data.length > pageDefaultNum4 * 10" class="page-item" :class="activeOn5" @click="activeSet(pageDefaultNum5)"><a class="page-link" href="#">{{pageDefaultNum5}}</a></li>
                <li class="page-item">
                  <a class="page-link" href="#" @click="nextPage" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <!-- modal -->
      <div class="modal fade" id="userUpdateModal" tabindex="-1" aria-labelledby="userUpdateModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold" id="userUpdateModalLabel">사용자 {{userPopTitle}}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form class="row g-3 needs-validation" novalidate @submit="clickSubmit" onsubmit="return false">
              <div class="modal-body text-start">
                <div class="mb-3">
                    <label for="adminId-text" class="col-form-label"><span class="text-danger fs-3">*</span>아이디:</label>
                    <input type="text" :disabled="idDisabled" class="form-control" v-model="userData.adminId" id="adminId-text" required autocomplete="off">
                    <div class="invalid-feedback">
                      아이디를 입력해주세요.
                    </div>
                </div>
                <div class="mb-4">
                    <label for="name-text" class="col-form-label"><span class="text-danger fs-3">*</span>이름:</label>
                    <input type="text" class="form-control" v-model="userData.name" id="name-text" required autocomplete="off">
                    <div class="invalid-feedback">
                      이름을 입력해주세요.
                    </div>
                </div>
                <div class="mb-4">
                    <label for="division-text" class="col-form-label">소속:</label>
                    <input type="text" class="form-control" v-model="userData.division" id="division-text" autocomplete="off">
                    <div class="invalid-feedback">
                      소속을 입력해주세요.
                    </div>
                </div>
                <div class="mb-4">
                    <label for="phone-text" class="col-form-label">전화:</label>
                    <input type="text" class="form-control" v-model="userData.phone" id="phone-text" autocomplete="off">
                    <div class="invalid-feedback">
                      전화를 입력해주세요.
                    </div>
                </div>
                <div v-if="isAdmin()" class="mb-4">
                    <label for="perms-text" class="col-form-label">권한:</label>
                    <select class="form-select" v-model="userData.perms" id="perms-text">
                      <option selected value="관리자">관리자</option>
                      <option value="사용자">사용자</option>
                    </select>
                </div>
                <div class="row">
                  <div class="col-sm-12">
                    <label for="passward-text" class="col-form-label">비밀번호:</label>
                    <div class="row">
                      <div class="col-8">
                        <input :disabled="validated == 1" v-model="userData.password" :type="passwordType" class="form-control" id="passward-text" autocomplete="off">
                      </div>
                      <div class="form-check col-4">
                        <input class="form-check-input" type="checkbox" @click="pwCheck" id="flexCheckDefault" v-model="pwCheckRemove" >
                        <label class="form-check-label" for="flexCheckDefault">
                            비밀번호 설정
                        </label>
                        <input class="form-check-input" type="checkbox" @click="pwShow" id="flexCheckDefault2" v-model="pwCheckShow" style="position:relative;top:23px">
                        <label class="form-check-label" for="flexCheckDefault2">
                            비밀번호 보이기
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                  <button v-show="userPopUorR == false" type="button" @click="clickDelete" class="btn btn-danger me-auto">삭제</button>
                  <button v-if="userPopUorR == true" type="submit"  class="btn btn-primary">등록</button>
                  <button v-else type="submit" class="btn btn-primary" >수정</button>
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" ref="closeModal">닫기</button>
              </div>
            </form>
          </div>
        </div>
        <div class="toast-container position-absolute top-0 end-0 p-3">
          <div class="toast" :class="display2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
              <strong class="me-auto">사용자 삭제</strong>
              <button type="button" class="btn-close" @click="closeDelete" ></button>
            </div>
            <div class="toast-body text-start">
              삭제하시겠습니까?
            </div>
            <div class="text-end">
              <button  type="button" class="btn btn-danger mb-2" @click="deleteToast">확인</button>
              <button type="button" class="btn btn-secondary ms-2 mb-2 me-2" @click="closeDelete">닫기</button>
            </div>
          </div>
        </div>
      </div>
      <div class="toast-container position-absolute top-0 end-0 p-3">
        <div class="toast" :class="display" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <strong class="me-auto">사용자 {{toastStats}}</strong>
            <button type="button" class="btn-close" @click="closeToast" ></button>
          </div>
          <div class="toast-body text-start">
            {{toastStats}}되었습니다.
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
const tableColumns = ['Id', '이름', '소속', '전화', '등록일', '최근로그인', '권한']
import { mapGetters } from 'vuex'
import moment from 'moment'
export default {
  data () {
    return {
      passwordType: 'password',
      toastStats: '',
      display: 'hide',
      display2: 'hide',
      pwCheckRemove: false,
      pwCheckShow: false,
      userList: {
        columns: [...tableColumns],
        data: []
      },
      pageNum: 0,
      pageSize: 10,
      validated: 1,
      userPopTitle: '',
      userPopUorR: true,
      id: 0,
      userData: {
        adminId: '',
        name: '',
        division: '',
        phone: '',
        perms: ''
      },
      pageDefaultNum1: 1,
      pageDefaultNum2: 2,
      pageDefaultNum3: 3,
      pageDefaultNum4: 4,
      pageDefaultNum5: 5,
      pervDisabled: '#',
      nextDisabled: '#',

      activeOn1: 'active',
      activeOn2: '',
      activeOn3: '',
      activeOn4: '',
      activeOn5: '',

      idDisabled: false,
    }
  },
  async mounted () {
    // 이벤트는 한번만 등록
    var forms = document.querySelectorAll('.needs-validation')

    // array로 변환할 필요가 있을 경우
    Array.prototype.slice.call(forms)
    // 각 인수를 form으로 보는 반복문
      .forEach(function (form) {
        // 각 index를 submit 했을 때
        form.addEventListener('submit', function (event) {
          // 만약 채크가 되어있지 않다면
          if (!form.checkValidity()) {
            // submit 이벤트를 막고
            event.preventDefault()
            event.stopPropagation()
          }
          // 그 결과를 UI로 나타낸다.
          form.classList.add('was-validated')
          // 자식부터 부모로 이벤트가 전파되는 것을 버블링(bubbling)이라고 한다. => false일 경우
        }, false)
      })

    this.getUserList()
  },
  methods: {
    ...mapGetters(["isAdmin", "getAdminId"]),
    pagingReset () {
      this.activeOn1 = 'active'
      this.activeOn2 = ''
      this.activeOn3 = ''
      this.activeOn4 = ''
      this.activeOn5 = ''

      this.pageDefaultNum1= 1
      this.pageDefaultNum2= 2
      this.pageDefaultNum3= 3
      this.pageDefaultNum4= 4
      this.pageDefaultNum5= 5
      
      this.pageNum = 0
    },
    async getUserList () {
      try {
        await this.pagingReset()
        let res = null;
        if(this.isAdmin()) {
          res = await this.axios.get('/v1/admins/all')
        } else {
          res = await this.axios.get(`/v1/admins/user?adminId=${this.getAdminId()}`)
        }
        this.userList.data = res.data.records
        for (let i = 0; i < this.userList.data.length; ++i) {
          this.userList.data[i].at = moment(this.userList.data[i].at).format('YYYY-MM-DD HH:mm:ss')
          if(this.userList.data[i].lastLogin) {
            this.userList.data[i].lastLogin = moment(this.userList.data[i].lastLogin).format('YYYY-MM-DD HH:mm:ss')
          }
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
    closeDelete () {
      this.display2 = 'hide'
    },
    closeToast () {
      this.display = 'hide'
    },
    prevPage () {
      if (this.pageDefaultNum1 !== 1) {
        this.activeOn1 = 'active'
        this.activeOn2 = ''
        this.activeOn3 = ''
        this.activeOn4 = ''
        this.activeOn5 = ''

        this.pageDefaultNum1 = this.pageDefaultNum1 - 5
        this.pageDefaultNum2 = this.pageDefaultNum2 - 5
        this.pageDefaultNum3 = this.pageDefaultNum3 - 5
        this.pageDefaultNum4 = this.pageDefaultNum4 - 5
        this.pageDefaultNum5 = this.pageDefaultNum5 - 5

        this.pageNum = this.pageDefaultNum1 - 1
      } else {
        this.activeOn1 = 'active'
        this.activeOn2 = ''
        this.activeOn3 = ''
        this.activeOn4 = ''
        this.activeOn5 = ''

        this.pageNum = 0
      }
    },
    nextPage () {
      let tableLen = this.userList.data.length
      if (tableLen >= this.pageDefaultNum5 * 10) {
        this.pageDefaultNum1 = this.pageDefaultNum1 + 5
        this.pageDefaultNum2 = this.pageDefaultNum2 + 5
        this.pageDefaultNum3 = this.pageDefaultNum3 + 5
        this.pageDefaultNum4 = this.pageDefaultNum4 + 5
        this.pageDefaultNum5 = this.pageDefaultNum5 + 5

        this.activeOn1 = 'active'
        this.activeOn2 = ''
        this.activeOn3 = ''
        this.activeOn4 = ''
        this.activeOn5 = ''

        this.pageNum = 0;

        this.pageNum = this.pageDefaultNum1-1
      } else {
        this.activeOn1 = ''
        this.activeOn2 = ''
        this.activeOn3 = ''
        this.activeOn4 = ''
        this.activeOn5 = ''

        let paging = 1;

        let pageNum = 0;

        let num1 = 0;
        let num2 = 0;

        num1 = tableLen / 10
        num2 = parseInt(tableLen / 10)
        if(num1 !== num2) {
          pageNum = num2
          paging = pageNum % 5 + 1
        } else {
          pageNum = num2-1
          paging = pageNum % 5 + 1 
        }

        this.pageNum = pageNum

         if (paging === 1) {
           this.activeOn1 = 'active'
         } else if (paging === 2) {
           this.activeOn2 = 'active'
         } else if (paging === 3) {
           this.activeOn3 = 'active'
         } else if (paging === 4) {
           this.activeOn4 = 'active'
         } else {
           this.activeOn5 = 'active'
         }
      }
    },
    activeSet (num) {
      this.activeOn1 = ''
      this.activeOn2 = ''
      this.activeOn3 = ''
      this.activeOn4 = ''
      this.activeOn5 = ''

      this.pageNum = num - 1

      if (num > 5) {
        num = num % 5
        if (num === 1) {
          this.activeOn1 = 'active'
        } else if (num === 2) {
          this.activeOn2 = 'active'
        } else if (num === 3) {
          this.activeOn3 = 'active'
        } else if (num === 4) {
          this.activeOn4 = 'active'
        } else {
          this.activeOn5 = 'active'
        }
      } else {
        if (num === 1) {
          this.activeOn1 = 'active'
        } else if (num === 2) {
          this.activeOn2 = 'active'
        } else if (num === 3) {
          this.activeOn3 = 'active'
        } else if (num === 4) {
          this.activeOn4 = 'active'
        } else {
          this.activeOn5 = 'active'
        }
      }
    },
    pwShow () {
      if(!this.pwCheckShow) {
        this.passwordType = 'text'
      } else {
        this.passwordType = 'password'
      }
    },
    pwCheck () {
      if (this.validated === 1) {
        this.userData.password = ''
        this.validated = 0
      } else {
        this.userData.password = ''
        this.validated = 1
      }
    },
    userPopR () {
      var forms = document.querySelectorAll('.needs-validation')
      Array.prototype.slice.call(forms)
        .forEach(function (form) {
          form.classList.remove('was-validated')
        })

      this.idDisabled = false

      this.userPopTitle = '등록'
      this.validated = 1
      this.userPopUorR = true
      this.pwCheckRemove = false
      this.pwCheckShow = false
      this.display2 = 'hide'

      this.userData.adminId = ''
      this.userData.password = ''
      this.userData.name = ''
      this.userData.division = ''
      this.userData.phone = ''
      this.userData.perms = '관리자'
    },
    userPopU (item) {
      var forms = document.querySelectorAll('.needs-validation')
      Array.prototype.slice.call(forms)
        .forEach(function (form) {
          form.classList.remove('was-validated')
        })

      this.idDisabled = true

      this.userPopTitle = '수정'
      this.validated = 1
      this.userPopUorR = false
      this.pwCheckRemove = false
      this.pwCheckShow = false
      this.display2 = 'hide'

      this.userData.adminId = item.adminId
      this.userData.password = ''
      this.userData.name = item.name
      this.userData.division = item.division
      this.userData.phone = item.phone
      this.userData.perms = item.perms
      this.id = item.id
    },
    clickSubmit () {
      if (this.userData.adminId !== '' && this.userData.name !== '' && this.userData.adminId !== null && this.userData.name !== null) {
        if (this.userPopTitle === '등록') {
          this.toastStats = '등록'
          this.clickInsert()
        } else {
          this.toastStats = '수정'
          this.clickUpdate()
        }
      }
    },
    async clickInsert () {
      try {
        const moment = require('moment')
        const today = moment()

        const nowsday = today.format('YYYY-MM-DD')
        const nowstime = today.format('h:mm:ss')

        const data = this.userData
        data.at = nowsday + ' ' + nowstime
        await this.axios.post('/v1/admins/add', data)
        this.getUserList()
        this.display = 'show'
        this.$refs.closeModal.click()
      } catch (error) {
        console.log(error)
        alert('아이디는 중복될 수 없습니다.')
      }
    },
    async clickUpdate () {
      try {
        const data = this.userData
        data.id = this.id
        await this.axios.put('/v1/admins/update', data)
        this.getUserList()

        this.display = 'show'
        this.$refs.closeModal.click()
      } catch (error) {
        console.log(error)
        alert('아이디는 중복될 수 없습니다.')
      }
      
    },
    clickDelete () {
      this.toastStats = '삭제'
      this.display2 = 'show'
    },
    async deleteToast () {
      this.display2 = 'hide'

      const id = this.id
      await this.axios.delete('/v1/admins/delete/' + id)
      this.getUserList()

      this.display = 'show'
      this.$refs.closeModal.click()
      
    }
  },
  computed: {
    pageCount () {
      const listLeng = this.userList.data.length
      const listSize = this.pageSize
      let page = Math.floor(listLeng / listSize)
      if (listLeng % listSize > 0) page += 1
      return page
    },
    paginatedData () {
      const start = this.pageNum * this.pageSize
      const end = start + this.pageSize
      return this.userList.data.slice(start, end)
    }
  }
}
</script>
