 <template>
  <div class="p-3">
    <div class="row">
      <div class="col-md-12">
        <h5 class="fw-bold text-start">DR 현황</h5>
        <div class="card mt-4">
          <div class="card-body">
            <!-- <div class="row">
              <button type="button" class="btn btn-info ms-auto me-3" style="flex-basis:110px;" @click="updateChart">&#8634;새로고침</button>
            </div> -->
            <div class="row justify-content-center">
              <div class="col-6">
                <vue3-chart-js
                    :id="LineChart.id"
                    ref="chartRef"
                    :type="LineChart.type"
                    :data="LineChart.data"
                    :options="LineChart.options"
                    @before-render="beforeRenderLogic"
                ></vue3-chart-js>
              </div>
            </div>
            <div class="row">
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
                    <th class="text-info" scope="col" v-for="column in table.columns" :key="column">{{column}}</th>
                    </tr>
                </thead>
                <tbody v-if="table.data.length != 0">
                  <tr v-for="(item, index) in paginatedData" :key="index" >
                    <td>{{item.startTime}}</td>
                    <td>{{item.endTime}}</td>
                    <td>{{item.issuedCBL}}</td>
                    <td>{{item.contractedCapacity}}</td>
                    <td>{{item.orderReduction}}</td>
                    <td>{{item.reductionGoal}}</td>
                    <td>{{item.mensurationVal}}</td>
                    <td>{{item.reduction}}</td>
                  </tr>
                </tbody>
                <tbody v-if="table.data.length == 0">
                  <tr>
                    <td colspan="3">데이터가 존재하지 않습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue3ChartJs from '@j-t-mcc/vue3-chartjs'
import { ref } from 'vue'

const tableColumns = ['기준 시작시간', '기준 종료시간', '발령CBL(kWh)', '계약약정용량(kW)', '발령감축량(kWh)', '감축목표(kWh)', '계량값(kWh)', '감축량']
const tableData = [{
  startTime: '14:00',
  endTime: '15:00',
  issuedCBL: '8,553.90',
  contractedCapacity: '7,000',
  orderReduction: '7,000',
  reductionGoal: '1,500',
  mensurationVal: '1,490.04',
  reduction: '7,063.86(100.9%)'
},
{
  startTime: '15:00',
  endTime: '16:00',
  issuedCBL: '8,750.60',
  contractedCapacity: '7,000',
  orderReduction: '7,000',
  reductionGoal: '1,600',
  mensurationVal: '1,751.36',
  reduction: '7,053.24(100.8%)'
}]
export default {
  name: 'App',
  components: {
    Vue3ChartJs
  },
  data () {
    return {
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
  },
  setup () {
    const chartRef = ref(null)
    const LineChart = {
      id: 'line',
      type: 'line',
      data: {
        labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
          '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
          '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
          '24:00'
        ],

        datasets: [
          {
            label: '계량값(kWh)',
            backgroundColor: [
              'green'
            ],
            data: [
              8100, 7900, 8000, 8100, 8200, 8300, 8200, 8100,
              8000, 7900, 7800, 7700, 7800, 7900, 7400, 1500,
              1600, 8100, 8300, 8400, 8500, 8300, 8400, 8500, 8400
            ],
            borderColor: 'green'
          },
          {
            label: '신뢰성CBL(kWh)',
            backgroundColor: [
              'skyblue'
            ],
            data: [
              7900, 8100, 8300, 8400, 8500, 8300, 8400, 8500,
              8100, 7900, 7800, 7800, 7900, 7800, 8000, 8100,
              7900, 8000, 8000, 7800, 7900, 8200, 8100, 7900, 7800
            ],
            borderColor: 'skyblue'
          },
          {
            label: '신뢰성감축목표',
            backgroundColor: [
              'red'
            ],
            data: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 1500,
              1600, 0, 0, 0, 0, 0, 0, 0, 0
            ],
            borderColor: 'red',
            type: 'bar'
          },
          {
            label: '경제성CBL(kWh)',
            backgroundColor: [
              'blue'
            ],
            data: [
              8100, 7800, 8100, 8200, 7900, 7800, 7900, 8000,
              8100, 8200, 8100, 7900, 8100, 8200, 8300, 8100,
              8100, 8200, 7800, 7900, 8100, 7900, 8000, 7900, 8200
            ],
            borderColor: 'blue'
          }
        ]
      },
      options: {
        low: 0,
        high: 8,
        showArea: false,
        height: '245px',
        axisX: {
          showGrid: false
        },
        lineSmooth: true,
        showLine: true,
        showPoint: true,
        fullWidth: true,
        chartPadding: {
          right: 50
        }
      }
    }
    const updateChart = () => {
      const PHRandomArr = []
      const ChlorineRandomArr = []
      const TurbidityRandomArr = []
      for (let i = 0; PHRandomArr.length < 25; i++) {
        let random = Math.random() * (8 - 6) + 6
        random = Math.round(random * 10) / 10.0
        if (random !== 8 || random !== 8) {
          PHRandomArr.push(random)
        }
      }

      for (let i = 0; ChlorineRandomArr.length < 25; i++) {
        let random = Math.random() * (2 - 1) + 1
        random = Math.round(random * 10) / 10.0
        if (random !== 0 || random !== 1) {
          ChlorineRandomArr.push(random)
        }
      }

      for (let i = 0; TurbidityRandomArr.length < 25; i++) {
        let random = Math.random() * (0.1 - 0.0) + 0.0
        random = Math.round(random * 100) / 100.0
        if (random !== 0 || random !== 1) {
          TurbidityRandomArr.push(random)
        }
      }

      LineChart.data.labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
        '24:00']
      LineChart.data.datasets = [
        {
          label: 'PH',
          backgroundColor: [
            'red'
          ],
          data: PHRandomArr,
          borderColor: 'red'
        },
        {
          label: '염소',
          backgroundColor: [
            'orange'
          ],
          data: ChlorineRandomArr,
          borderColor: 'orange'
        },
        {
          label: '탁도',
          backgroundColor: [
            '#41B883'
          ],
          data: TurbidityRandomArr,
          borderColor: '#41B883'
        }
      ]
      chartRef.value.update()
    }
    const beforeRenderLogic = (event) => {
      // ...
      // if(a === b) {
      //  event.preventDefault()
      // }
    }
    return {
      LineChart,
      updateChart,
      chartRef,
      beforeRenderLogic
    }
  }
}
</script>
