<template>
<div class="p-3" @mousedown="closeToast">
  <div class="row">
    <div class="col-md-12">
      <h5 class="fw-bold text-start">월별 사용량 데이터</h5>
      <div class="card mt-4">
        <div class="card-body">
          <div class="row">
            <div class="col-1">
              <datepicker class="form-control bg-white text-center" v-model="nowsday" inputFormat='yyyy' startingView='year' minimumView='year' monthHeadingFormat='yyyy' :locale="locale"/>
            </div>&#8275;
            <div class="col-1">
              <datepicker class="form-control bg-white text-center" v-model="nowsday2" inputFormat='yyyy' startingView='year' minimumView='year' monthHeadingFormat='yyyy' :locale="locale"/>
            </div>
            <button type="button" class="btn btn-info text-white" style="flex-basis:60px;" @click="clickSearch">검색</button>
            <button type="button" class="btn btn-info text-white ms-auto me-3" style="flex-basis:90px;" data-bs-toggle="modal" data-bs-target="#userUpdateModal" @click="userPopR">비용등록</button>
            <!-- <button type="button" class="btn btn-info text-white ms-3 me-3" style="flex-basis:130px;">엑셀파일저장</button> -->
          </div>
          <div class="row mt-3">
              <table class="table">
              <colgroup>
                <col width = "12%">
                <col width = "12%">
                <col width = "12%">
                <col width = "12%">
                <col width = "12%">
                <col width = "12%">
                <col width = "12%">
                <col width = "12%">
              </colgroup>
              <thead>
                  <tr>
                  <th scope="col" v-for="column in table.columns" :key="column">{{column}}</th>
                  </tr>
              </thead>
              <tbody v-if="table.data.length != 0">
                <tr v-for="(item, index) in paginatedData" :key="index" >
                  <td>{{item.year}}</td>
                  <td style="color:#00BFFF;cursor:pointer" data-bs-toggle="modal" data-bs-target="#userUpdateModal" @click="userPopU(item)">{{item.month}}</td>
                  <td>{{item.residentialUsage}}</td>
                  <td>{{item.residentialRates}}</td>
                  <td>{{item.IndustrialUsage}}</td>
                  <td>{{item.IndustrialRates}}</td>
                  <td>{{item.streetLampUsage}}</td>
                  <td>{{item.streetLampRates}}</td>
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
                <h5 class="modal-title fw-bold" id="userUpdateModalLabel">월별사용량 {{userPopTitle}}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form class="row g-3 needs-validation" novalidate @submit="clickSubmit" onsubmit="return false">
              <div class="modal-body text-start">
                <div class="mb-3">
                    <label for="date-text" class="col-form-label">년월:</label>
                    <datepicker class="form-control" :disabled="dateDisabled" :style="{ backgroundColor: datebg }" v-model="userData.date" inputFormat='yyyy-MM' startingView='month' minimumView='month' monthHeadingFormat='yyyy-MM' :locale="locale"/>
                    <div class="invalid-feedback">
                      년월을 입력해주세요.
                    </div>
                </div>
                <div class="mb-3">
                    <label for="residentialUsage-text" class="col-form-label">주택용사용량(kWh):</label>
                    <input @keyup="addCommas(userData.residentialUsage, 1)" type="text" class="form-control" v-model="userData.residentialUsage" id="residentialUsage-text" autocomplete="off">
                    <div class="invalid-feedback">
                      주택용사용량을 입력해주세요.
                    </div>
                </div>
                <div class="mb-3">
                    <label for="residentialRates-text" class="col-form-label">주택용요금(원):</label>
                    <input @keyup="addCommas(userData.residentialRates, 2)" type="text" class="form-control" v-model="userData.residentialRates" id="residentialRates-text" autocomplete="off">
                    <div class="invalid-feedback">
                      주택용요금을 입력해주세요.
                    </div>
                </div>
                <div class="mb-3">
                    <label for="IndustrialUsage-text" class="col-form-label">산업용사용량(kWh)</label>
                    <input @keyup="addCommas(userData.IndustrialUsage, 3)" type="text" class="form-control" v-model="userData.IndustrialUsage" id="IndustrialUsage-text" autocomplete="off">
                    <div class="invalid-feedback">
                      산업용사용량을 입력해주세요.
                    </div>
                </div>
                <div class="mb-3">
                    <label for="IndustrialRates-text" class="col-form-label">산업용요금(원):</label>
                    <input @keyup="addCommas(userData.IndustrialRates, 4)" type="text" class="form-control" v-model="userData.IndustrialRates" id="IndustrialRates-text" autocomplete="off">
                    <div class="invalid-feedback">
                      산업용요금을 입력해주세요.
                    </div>
                </div>
                <div class="mb-3">
                    <label for="streetLampUsage-text" class="col-form-label">가로등사용량(kWh):</label>
                    <input @keyup="addCommas(userData.streetLampUsage, 5)" type="text" class="form-control" v-model="userData.streetLampUsage" id="streetLampUsage-text" autocomplete="off">
                    <div class="invalid-feedback">
                      가로등사용량을 입력해주세요.
                    </div>
                </div>
                <div class="mb-3">
                    <label for="streetLampRates-text" class="col-form-label">가로등요금(원):</label>
                    <input @keyup="addCommas(userData.streetLampRates, 6)" type="text" class="form-control" v-model="userData.streetLampRates" id="streetLampRates-text" autocomplete="off">
                    <div class="invalid-feedback">
                      가로등요금을 입력해주세요.
                    </div>
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
              <strong class="me-auto">월별사용량 삭제</strong>
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
            <strong class="me-auto">월별사용량 {{toastStats}}</strong>
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

const tableColumns = ['년도', '월', '주택용사용량(kWh)', '주택용요금(원)', '산업용사용량(kWh)', '산업용요금(원)', '가로등사용량(kWh)', '가로등요금(원)']

export default {
  components: {
    Datepicker
  },
  data () {
    return {
      locale: ko,
      nowsday: ref(new Date()),
      nowsday2: ref(new Date()),
      table: {
        columns: [...tableColumns],
        data: []
      },
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
      dateDisabled: true,
      datebg: '#e9ecef',

      activeOn1: 'active',
      activeOn2: '',
      activeOn3: '',
      activeOn4: '',
      activeOn5: ''
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

    this.getMonthUsageList()
  },
  watch : {
    nowsday: 'getMonthUsageList',
    nowsday2: 'getMonthUsageList'
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
    clickSearch () {
      this.getMonthUsageList()
    },
    async getMonthUsageList () {
      let startDt = moment(this.nowsday).format('YYYY')
      startDt = startDt + '-01'
      let endDt = moment(this.nowsday2).format('YYYY')
      endDt = endDt +'-12'
      try {
        await this.pagingReset()

        const res = await this.axios.get(`/v1/monthusage/search-list?&startDt=${startDt}&endDt=${endDt}`)
        this.table.data = res.data.records
        for (let i = 0; i < this.table.data.length; ++i) {
          const regDate = this.table.data[i].date
          const dateArr = regDate.split('-')
          this.table.data[i].year = dateArr[0]
          this.table.data[i].month = dateArr[1]

          this.table.data[i].residentialUsage = this.table.data[i].residentialUsage.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
          this.table.data[i].residentialRates = this.table.data[i].residentialRates.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
          this.table.data[i].IndustrialUsage = this.table.data[i].IndustrialUsage.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
          this.table.data[i].IndustrialRates = this.table.data[i].IndustrialRates.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
          this.table.data[i].streetLampUsage = this.table.data[i].streetLampUsage.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
          this.table.data[i].streetLampRates = this.table.data[i].streetLampRates.toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
    addCommas (x , y) {
      x = x.replace(/[^0-9]/g,'');   // 입력값이 숫자가 아니면 공백
      x = x.replace(/,/g,'');        // ,값 공백처리
      if(y == 1) this.userData.residentialUsage = x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      else if(y == 2) this.userData.residentialRates = x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      else if(y == 3) this.userData.IndustrialUsage = x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      else if(y == 4) this.userData.IndustrialRates = x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      else if(y == 5) this.userData.streetLampUsage = x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      else this.userData.streetLampRates = x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

      this.userPopTitle = '등록'
      this.validated = 1
      this.userPopUorR = true
      this.display2 = 'hide'
      this.dateDisabled = false
      this.datebg = 'white'

      this.userData.date = ref(new Date())
      this.userData.year = ''
      this.userData.month = ''
      this.userData.residentialUsage = ''
      this.userData.residentialRates = ''
      this.userData.IndustrialUsage = ''
      this.userData.IndustrialRates = ''
      this.userData.streetLampUsage = ''
      this.userData.streetLampRates = ''
      this.id = 0;
    },
    userPopU (item) {
      var forms = document.querySelectorAll('.needs-validation')
      Array.prototype.slice.call(forms)
        .forEach(function (form) {
          form.classList.remove('was-validated')
        })

      this.userPopTitle = '수정'
      this.validated = 1
      this.userPopUorR = false
      this.display2 = 'hide'
      this.dateDisabled = true
      this.datebg = '#e9ecef'

      this.userData.date = ref(new Date(item.date))
      this.userData.residentialUsage = item.residentialUsage
      this.userData.residentialRates = item.residentialRates
      this.userData.IndustrialUsage = item.IndustrialUsage
      this.userData.IndustrialRates = item.IndustrialRates
      this.userData.streetLampUsage = item.streetLampUsage
      this.userData.streetLampRates = item.streetLampRates
      this.id = item.id
    },
    clickSubmit () {
      if (this.userData.date !== '' ) {
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
      const reqData = { ...this.userData }
      reqData.date = moment(reqData.date).format('YYYY-MM')
      if(reqData.residentialUsage !== '') {
        reqData.residentialUsage = parseInt(reqData.residentialUsage.replace(/,/g,''))
      } else {
        reqData.residentialUsage = 0
      }
      if(reqData.residentialRates !== '') {
      reqData.residentialRates = parseInt(reqData.residentialRates.replace(/,/g,''))
      } else {
        reqData.residentialRates = 0
      }
      if(reqData.IndustrialUsage !== '') {
      reqData.IndustrialUsage = parseInt(reqData.IndustrialUsage.replace(/,/g,''))
      } else {
        reqData.IndustrialUsage = 0
      }
      if(reqData.IndustrialRates !== '') {
      reqData.IndustrialRates = parseInt(reqData.IndustrialRates.replace(/,/g,''))
      } else {
        reqData.IndustrialRates = 0
      }
      if(reqData.streetLampUsage !== '') {
      reqData.streetLampUsage = parseInt(reqData.streetLampUsage.replace(/,/g,''))
      } else {
        reqData.streetLampUsage = 0
      }
      if(reqData.streetLampRates !== '') {
      reqData.streetLampRates = parseInt(reqData.streetLampRates.replace(/,/g,''))
      } else {
        reqData.streetLampRates = 0
      }
      delete reqData.year
      delete reqData.month

      try{
        await this.axios.post('/v1/monthUsage/add', reqData)
        this.getMonthUsageList()

        this.display = 'show'
        this.$refs.closeModal.click()
      } catch (error) {
        console.log(error)
        alert('등록된 년월은 등록할 수 없습니다.')
      }

    },
    async clickUpdate () {
      const reqData = { ...this.userData }
      reqData.date = moment(reqData.date).format('YYYY-MM')
      reqData.residentialUsage = parseInt(reqData.residentialUsage.replace(/,/g,''))
      reqData.residentialRates = parseInt(reqData.residentialRates.replace(/,/g,''))
      reqData.IndustrialUsage = parseInt(reqData.IndustrialUsage.replace(/,/g,''))
      reqData.IndustrialRates = parseInt(reqData.IndustrialRates.replace(/,/g,''))
      reqData.streetLampUsage = parseInt(reqData.streetLampUsage.replace(/,/g,''))
      reqData.streetLampRates = parseInt(reqData.streetLampRates.replace(/,/g,''))
      delete reqData.year
      delete reqData.month
      reqData.id = this.id
      await this.axios.put('/v1/monthUsage/update', reqData)
      this.getMonthUsageList()

      this.display = 'show'
      this.$refs.closeModal.click()
    },
    clickDelete () {
      this.toastStats = '삭제'
      this.display2 = 'show'
    },
    async deleteToast () {
      this.display2 = 'hide'
     
      const id = this.id
      await this.axios.delete('/v1/monthUsage/delete/' + id)
      this.getMonthUsageList()

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
