<template>
<div class="p-3">
  <div class="row">
    <div class="col-md-12">
      <h5 class="fw-bold text-start">에너지사용량 통계</h5>
      <div class="card mt-4">
        <div class="card-body">
          <div class="row">
            <div class="col-2">
              <select class="form-select" id="auth-text">
                <option selected value="DHT11">전체사용량</option>
                <option value="지역1">지역1</option>
                <option value="지역2">지역2</option>
              </select>
            </div>
            <div class="col-2">
              <datepicker class="form-control bg-white" v-model="nowsday" :locale="locale"/>
            </div>&#8275;
            <div class="col-2">
              <datepicker class="form-control bg-white" v-model="nowsday" :locale="locale"/>
            </div>
            <button type="button" class="btn btn-info text-white" style="flex-basis:60px;" @click="clickSearch">검색</button>
          </div>
          <div class="row mt-3">
            <table class="table">
              <colgroup>
                <col width = "33%">
                <col width = "33%">
                <col width = "33%">
              </colgroup>
              <thead>
                  <tr>
                  <th scope="col" v-for="column in table.columns" :key="column">{{column}}</th>
                  </tr>
              </thead>
              <tbody v-if="table.data.length != 0">
                <tr v-for="(item, index) in paginatedData" :key="index" >
                  <td>{{item.measureDate}}</td>
                  <td>{{item.cumulativeUsage}}</td>
                  <td>{{item.usage}}</td>
                </tr>
              </tbody>
              <tbody v-if="table.data.length == 0">
                <tr>
                  <td colspan="3">데이터가 존재하지 않습니다.</td>
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

const tableColumns = ['일자', '누적사용량(kWh)', '사용량(kWh)']
const tableData = [{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '12'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '13'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '14'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '15'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '13'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '14'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '11'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '13'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '11'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '14'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '12'
},
{
  measureDate: '2021-05-19 12:10:30',
  cumulativeUsage: '1234.5',
  usage: '13'
}]

export default {
  components: {
    Datepicker
  },
  data () {
    return {
      locale: ko,
      nowsday: ref(new Date()),
      table: {
        columns: [...tableColumns],
        data: [...tableData]
      },
      list: function () {
        var list = []
        for (var i = this.startIndex; i < this.endIndex; i++) {
          this.list.push(tableData[i])
        }
        return list
      },
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
