<template>
<div class="p-3" @mousedown="closeToast">
  <div class="row">
    <div class="col-md-12">
      <h5 class="fw-bold text-start">설비 관리</h5>
      <div class="card mt-4">
        <div class="card-body">
          <div class="row">
            <div class="text-end">
              <button type="button" class="btn btn-info btn-fill text-white" data-bs-toggle="modal" data-bs-target="#userUpdateModal" @click="userPopR">
                설비등록
              </button>
            </div>
          </div>
          <div class="row mt-3">
            <table class="table">
              <colgroup>
                <col width = "14%">
                <col width = "18%">
                <col width = "10%">
                <col width = "14%">
                <col width = "14%">
                <col width = "14%">
                <col />
              </colgroup>
              <thead>
                  <tr>
                  <th v-for="column in table.columns" :key="column">{{column}}</th>
                  </tr>
              </thead>
              <tbody v-if="table.data.length != 0">
                <tr v-for="(item, index) in paginatedData" :key="index" >
                  <td>{{item.regNo}}</td>
                  <td style="color:#00BFFF;cursor:pointer" data-bs-toggle="modal" data-bs-target="#userUpdateModal" @click="userPopU(item, index)">{{item.name}}</td>
                  <td>{{item.capacity}}</td>
                  <td>{{item.location}}</td>
                  <td>{{item.regDate}}</td>
                  <td>{{item.type}}</td>
                  <td>{{item.note}}</td>
                </tr>
              </tbody>
              <tbody v-if="table.data.length == 0">
                <tr>
                  <td colspan="8">데이터가 존재하지 않습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="row" v-if="table.data.length != 0">
            <nav aria-label="Page navigation example" class="d-flex flex-row-reverse bd-highlight">
              <ul class="pagination">
                <li class="page-item">
                  <a class="page-link" href="#" @click="prevPage" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li class="page-item" :class="activeOn1" @click="activeSet(pageDefaultNum1)"><a class="page-link" href="#">{{pageDefaultNum1}}</a></li>
                <li v-if="table.data.length > pageDefaultNum1 * 10" class="page-item" :class="activeOn2" @click="activeSet(pageDefaultNum2)"><a class="page-link" href="#">{{pageDefaultNum2}}</a></li>
                <li v-if="table.data.length > pageDefaultNum2 * 10" class="page-item" :class="activeOn3" @click="activeSet(pageDefaultNum3)"><a class="page-link" href="#">{{pageDefaultNum3}}</a></li>
                <li v-if="table.data.length > pageDefaultNum3 * 10" class="page-item" :class="activeOn4" @click="activeSet(pageDefaultNum4)"><a class="page-link" href="#">{{pageDefaultNum4}}</a></li>
                <li v-if="table.data.length > pageDefaultNum4 * 10" class="page-item" :class="activeOn5" @click="activeSet(pageDefaultNum5)"><a class="page-link" href="#">{{pageDefaultNum5}}</a></li>
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
              <h5 class="modal-title fw-bold" id="userUpdateModalLabel">설비 {{userPopTitle}}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form class="row g-3 needs-validation" novalidate @submit="clickSubmit" onsubmit="return false">
              <div class="modal-body text-start">
                <div class="mb-3">
                    <label for="regNo-text" class="col-form-label"><span class="text-danger fs-3">*</span>관리번호:</label>
                    <input type="text" :disabled="regNoDisabled" class="form-control" v-model="userData.regNo" id="regNo-text" required autocomplete="off">
                    <div class="invalid-feedback">
                      관리번호를 입력해주세요.
                    </div>
                </div>
                <div class="mb-4">
                    <label for="name-text" class="col-form-label"><span class="text-danger fs-3">*</span>설비명:</label>
                    <input type="text" class="form-control" v-model="userData.name" id="name-text" required autocomplete="off">
                    <div class="invalid-feedback">
                      설비명을 입력해주세요.
                    </div>
                </div>
                <div class="mb-4">
                    <label for="capacity-text" class="col-form-label">최대용량(kWh):</label>
                    <input type="text" @keyup="addCommas(userData.capacity)" class="form-control" v-model="userData.capacity" id="capacity-text" autocomplete="off">
                    <div class="invalid-feedback">
                      최대용량을 입력해주세요.
                    </div>
                </div>
                <div class="mb-4">
                    <label for="location-text" class="col-form-label">설비위치:</label>
                    <input type="text" class="form-control" v-model="userData.location" id="location-text" autocomplete="off">
                    <div class="invalid-feedback">
                      설비위치를 입력해주세요.
                    </div>
                </div>
                <div class="mb-4">
                    <label for="regDate-text" class="col-form-label">등록일:</label>
                    <datepicker class="form-control bg-white" v-model="userData.regDate" id="regDate-text" :locale="locale"/>
                </div>
                <div class="mb-4">
                    <label for="type-text" class="col-form-label">타입:</label>
                    <select class="form-select" v-model="userData.type" id="type-text">
                      <option value="메인">메인</option>
                      <option value="변압기">변압기</option>
                      <option value="공용변압기">공용변압기</option>
                      <option value="주요계통">주요계통</option>
                      <option value="기타">기타</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label for="note-text" class="col-form-label">비고:</label>
                    <input type="text" class="form-control" v-model="userData.note" id="note-text" autocomplete="off">
                </div>
                <div class="modal-footer">
                    <button v-show="userPopUorR == false" type="button" @click="clickDelete" class="btn btn-danger me-auto">삭제</button>
                    <button v-if="userPopUorR == true" type="submit" class="btn btn-primary">등록</button>
                    <button v-else type="submit" class="btn btn-primary">수정</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" ref="closeModal">닫기</button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="toast-container position-absolute top-0 end-0 p-3">
          <div class="toast" :class="display2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
              <strong class="me-auto">설비 삭제</strong>
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
            <strong class="me-auto">설비 {{toastStats}}</strong>
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
import Datepicker from 'vue3-datepicker'
import { ko } from 'date-fns/locale'
import { ref } from 'vue'
import moment from 'moment'
const tableColumns = ['관리번호', '설비명', '최대용량(kWh)', '설치위치', '등록일', '타입', '비고']
export default {
  components: {
    Datepicker
  },
  data () {
    return {
      locale: ko,
      table: {
        columns: [...tableColumns],
        data: []
      },
      regNoDisabled: false,
      toastStats: '',
      display: 'hide',
      display2: 'hide',
      pageNum: 0,
      pageSize: 10,
      validated: 1,
      userPopTitle: '',
      userPopUorR: true,
      id: 0,
      userData: {},
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
      activeOn5: ''
    }
  },
  mounted () {
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

    this.getFacilityList()
  },
  methods: {
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
    async getFacilityList () {
      try {
        await this.pagingReset()

        const res = await this.axios.get('/v1/facilities/all')
        this.table.data = res.data.records
        for (let i = 0; i < this.table.data.length; ++i) {
          if(this.table.data[i].capacity !== null) {
          this.table.data[i].capacity = this.table.data[i].capacity.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
          }
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
    addCommas (x) { 
      if(x !== '') {
        x = x.replace(/[^0-9]/g,'');   // 입력값이 숫자가 아니면 공백
        x = x.replace(/,/g,'');        // ,값 공백처리
        this.userData.capacity = x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
      let tableLen = this.table.data.length
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
    pwCheck () {
      if (this.validated === 1) {
        this.validated = 0
      } else {
        this.validated = 1
      }
    },
    userPopR () {
      var forms = document.querySelectorAll('.needs-validation')
      Array.prototype.slice.call(forms)
        .forEach(function (form) {
          form.classList.remove('was-validated')
        })
      
      this.regNoDisabled = false

      this.userPopTitle = '등록'
      this.validated = 1
      this.userPopUorR = true
      this.display2 = 'hide'

      this.userData.regNo = ''
      this.userData.name = ''
      this.userData.capacity = null
      this.userData.location = ''
      this.userData.regDate = ref(new Date())
      this.userData.type = '메인'
      this.userData.note = ''
      this.id = 0
    },
    userPopU (item) {
      var forms = document.querySelectorAll('.needs-validation')
      Array.prototype.slice.call(forms)
        .forEach(function (form) {
          form.classList.remove('was-validated')
        })

      this.regNoDisabled = true

      this.userPopTitle = '수정'
      this.validated = 1
      this.userPopUorR = false
      this.display2 = 'hide'


      this.userData.regNo = item.regNo
      this.userData.name = item.name
      this.userData.capacity = item.capacity
      this.userData.location = item.location
      this.userData.regDate = ref(new Date(item.regDate))
      this.userData.type = item.type
      this.userData.note = item.note
      this.id = item.id
    },
    clickSubmit () {
      if (this.userData.regNo !== '' && this.userData.name !== '') {
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
      try{
        const reqData = { ...this.userData }
        reqData.regDate = moment(reqData.regDate).format('YYYY-MM-DD')
        reqData.capacity = parseFloat(reqData.capacity.replace(/,/g,''))
        await this.axios.post('/v1/facilities/add', reqData)
        this.getFacilityList()

        this.display = 'show'
        this.$refs.closeModal.click()
      } catch (error) {
        alert('관리번호는 중복될 수 없습니다.')
      }
    },
    async clickUpdate () {
      try{
        const reqData = { ...this.userData }
        reqData.regDate = moment(reqData.regDate).format('YYYY-MM-DD')
        reqData.capacity = parseFloat(reqData.capacity.replace(/,/g,''))
        reqData.id = this.id
        await this.axios.put('/v1/facilities/update', reqData)
        this.getFacilityList()

        this.display = 'show'
        this.$refs.closeModal.click()
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
    clickDelete () {
      this.toastStats = '삭제'
      this.display2 = 'show'
    },
    async deleteToast () {
      this.display2 = 'hide'

      const id = this.id
      await this.axios.delete('/v1/facilities/delete/' + id)
      this.getFacilityList()

      this.display = 'show'
      this.$refs.closeModal.click()
    }
  },
  computed: {
    pageCount () {
      const listLeng = this.table.data.length
      const listSize = this.pageSize
      let page = Math.floor(listLeng / listSize)
      if (listLeng % listSize > 0) page += 1
      return page
    },
    paginatedData () {
      const start = this.pageNum * this.pageSize
      const end = start + this.pageSize
      return this.table.data.slice(start, end)
    }
  }
}
</script>
