<template>
<div class="p-3">
  <div class="row">
    <div class="col-md-12">
      <h5 class="fw-bold text-start">미터기 별 통신율</h5>
      <div class="card mt-4">
        <div class="card-body">
          <div class="row">
            <div class="col-2">
              <datepicker class="form-control bg-white" v-model="nowsday" :locale="locale"/>
            </div>&#8275;
            <div class="col-2">
              <datepicker class="form-control bg-white" v-model="nowsday2" :locale="locale"/>
            </div>
            <button type="button" class="btn btn-info text-white" style="flex-basis:60px;" @click="clickSearch">검색</button>
          </div>
          <div class="row mt-3">
            <table class="table">
              <colgroup>
                <col width = "25%">
                <col width = "25%">
                <col width = "25%">
                <col width = "25%">
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" v-for="column in table.columns" :key="column">{{column}}</th>
                </tr>
              </thead>
              <tbody v-if="table.data.length != 0">
                <tr v-for="(item, index) in paginatedData" :key="index" >
                  <td>{{item.meterName}}</td>
                  <td>{{item.countTotal}}</td>
                  <td>{{item.count}}</td>
                  <td>{{item.countPer}}%</td>
                </tr>
              </tbody>
              <tbody v-if="table.data.length == 0">
                <tr>
                  <td colspan="4">데이터가 존재하지 않습니다.</td>
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
    </div>
  </div>
</div>
</template>

<script>
import Datepicker from 'vue3-datepicker'
import { ko } from 'date-fns/locale'
import { ref } from 'vue'
import moment from 'moment'
const tableColumns = ['미터기명','예상건수', '현재건수', '통신율[%]']

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
      
      meters: [],
      meterId: 0,
      pageNum: 0,
      pageSize: 10,

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
  async mounted () {
    await this.getMeterList()
    this.getUsageList()
  },
  watch : {
    meterId : 'getUsageList',
    nowsday : 'getUsageList',
    nowsday2 : 'getUsageList'
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
      this.getUsageList()
    },
    async getMeterList () {
      try {
        const res = await this.axios.get('/v1/meters/all')
        this.meters = res.data.records
        if(this.meters.length !==0) {
          this.meterId = this.meters[0].id
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
    async getUsageList () {

      await this.pagingReset()

      const startDt = moment(this.nowsday).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const endDt = moment(this.nowsday2).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      try {
        const res = await this.axios.get(`/v1/usage/search-listPerTotal?startDt=${startDt}&endDt=${endDt}`)
        this.table.data = res.data.records

        let start = moment(this.nowsday).startOf('day')
        let now = moment()
        let end = moment(this.nowsday2).endOf('day')
        if (now.isSame(end, 'day')) {
          end = now
        }
        //Difference in number of days
        let diff = moment.duration(end.diff(start)).asMinutes()
            diff = parseInt(diff)

        let diffDay = moment.duration(end.diff(start)).asDays()
            diffDay = parseInt(diffDay)

        for (let i = 0; i < this.table.data.length; ++i) {
          const meterId = this.table.data[i].meterId
          let total = 0
          if(meterId == 1) {
            total = diff / 5 - diffDay
            total = Math.floor(total)
          } else {
            if (now.isSame(end, 'day')) {
              total = diff
            } else {
              total = diff + 1
            }
          }
          const totalPer = total / 100

          let metername = ''
          for (let i = 0; i < this.meters.length; i++) {
            if(this.meters[i].id == meterId) {
              metername = this.meters[i].metername
            }
          }         
          this.table.data[i].meterName = metername
          this.table.data[i].countTotal = total
          this.table.data[i].countPer = (this.table.data[i].count / totalPer).toFixed(0)
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
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
