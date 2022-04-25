 <template>
  <div class="p-3">
    <div class="row">
    <div class="col-md-12">
      <h5 class="fw-bold text-start">월별 전기 사용량 차트</h5>
      <div class="card mt-4">
        <div class="card-body">
          <div class="row">
            <div class="col-1">
              <datepicker  class="form-control bg-white text-center" v-model="nowsday"  inputFormat='yyyy' startingView='year' minimumView='year' :locale="locale"/>
            </div>
            <button type="button" class="btn btn-info ms-auto me-3 text-white" style="flex-basis:122px;" @click="insertChartData">&#9636;데이터입력</button>
          </div>
          <div class="row justify-content-center">
            <div class="col-6">
              <h5 class="fw-bold text-center">전기 사용량</h5>
              <vue3-chart-js
                  :id="BarChart.id"
                  ref="chartRef"
                  :type="BarChart.type"
                  :data="BarChart.data"
                  :options="BarChart.options"
              ></vue3-chart-js>
            </div>
            <div class="col-6">
              <h5 class="fw-bold text-center">전기요금</h5>
              <vue3-chart-js
                  :id="BarChart2.id"
                  ref="chartRef2"
                  :type="BarChart2.type"
                  :data="BarChart2.data"
                  :options="BarChart2.options"
              ></vue3-chart-js>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
<script>
import Vue3ChartJs from '@j-t-mcc/vue3-chartjs'
import Datepicker from 'vue3-datepicker'
import { ko } from 'date-fns/locale'
import { ref } from 'vue'
import moment from 'moment'

export default {
  name: 'App',
  components: {
    Vue3ChartJs,
    Datepicker
  },
  data () {
    return {
      locale: ko,
      nowsday: ref(new Date()),
      monthusages: [],

      residentialUsage: [],
      IndustrialUsage: [],
      streetLampUsage: [],
      residentialRates: [],
      IndustrialRates: [],
      streetLampRates: [],

      BarChart: {
        id: 'bar',
        type: 'bar',
        data: {
          labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
          datasets: [
            {
              label: '주택용사용량',
              backgroundColor: [
                'grey'
              ],
              data: [],
              borderColor: 'grey'
            },
            {
              label: '산업용사용량',
              backgroundColor: [
                'skyblue'
              ],
              data: [],
              borderColor: 'skyblue'
            },
            {
              label: '가로등사용량',
              backgroundColor: [
                'blue'
              ],
              data: [],
              borderColor: 'blue'
            }
          ],
        },
        options: {
          low: 0,
          high: 3,
          showArea: false,
          height: '50px',
          axisX: {
            showGrid: false
          },
          lineSmooth: true,
          showLine: true,
          showPoint: true,
          fullWidth: false,
          chartPadding: {
            right: 50
          },
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true
            }
          }
        }
      },

      BarChart2: {
        id: 'bar',
        type: 'bar',
        data: {
          labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
          datasets: [
            {
              label: '주택용요금',
              backgroundColor: [
                '#DAA520'
              ],
              data: [],
              borderColor: '#DAA520'
            },
            {
              label: '산업용요금',
              backgroundColor: [
                'green'
              ],
              data: [],
              borderColor: 'green'
            },
            {
              label: '가로등요금',
              backgroundColor: [
                'brown'
              ],
              data: [],
              borderColor: 'brown'
            }
          ],
        },
        options: {
          low: 0,
          high: 3,
          showArea: false,
          height: '50px',
          axisX: {
            showGrid: false
          },
          lineSmooth: true,
          showLine: true,
          showPoint: true,
          fullWidth: false,
          chartPadding: {
            right: 50
          },
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true
            }
          }
        }
      }
    }
  },
  mounted () {
    this.getMonthUsageList()
  },
  watch: {
    nowsday: 'getMonthUsageList'
  },
  methods: {
    insertChartData () {
      this.$router.push('/energyCostMonth')
    },
    async getMonthUsageList () {
      try {
        const res = await this.axios.get('/v1/monthUsage/all')
        this.monthusages = res.data.records
        const nowsday = moment(this.nowsday).format('YYYY')

        this.residentialUsage = []
        this.IndustrialUsage = []
        this.streetLampUsage = []

        this.residentialRates = []
        this.IndustrialRates = []
        this.streetLampRates = []

        for (let i = 0; i < this.monthusages.length; ++i) {
          const regDate = this.monthusages[i].date
          const dateArr = regDate.split('-')
          this.monthusages[i].year = dateArr[0]
          this.monthusages[i].month = dateArr[1]

          const year = this.monthusages[i].year
          const month = this.monthusages[i].month

          const residentialUsage = parseInt(this.monthusages[i].residentialUsage)
          const IndustrialUsage = parseInt(this.monthusages[i].IndustrialUsage)
          const streetLampUsage = parseInt(this.monthusages[i].streetLampUsage)
          const residentialRates = parseInt(this.monthusages[i].residentialRates)
          const IndustrialRates = parseInt(this.monthusages[i].IndustrialRates)
          const streetLampRates = parseInt(this.monthusages[i].streetLampRates)
          
          if(year == nowsday) {
            if(month == "01") {
              this.residentialUsage[0] = residentialUsage
              this.IndustrialUsage[0] = IndustrialUsage
              this.streetLampUsage[0] = streetLampUsage

              this.residentialRates[0] = residentialRates
              this.IndustrialRates[0] = IndustrialRates
              this.streetLampRates[0] = streetLampRates
            }
            if(month == "02") {
              this.residentialUsage[1] = residentialUsage
              this.IndustrialUsage[1] = IndustrialUsage
              this.streetLampUsage[1] = streetLampUsage

              this.residentialRates[1] = residentialRates
              this.IndustrialRates[1] = IndustrialRates
              this.streetLampRates[1] = streetLampRates
            }
            if(month == "03") {
              this.residentialUsage[2] = residentialUsage
              this.IndustrialUsage[2] = IndustrialUsage
              this.streetLampUsage[2] = streetLampUsage

              this.residentialRates[2] = residentialRates
              this.IndustrialRates[2] = IndustrialRates
              this.streetLampRates[2] = streetLampRates
            }
            if(month == "04") {
              this.residentialUsage[3] = residentialUsage
              this.IndustrialUsage[3] = IndustrialUsage
              this.streetLampUsage[3] = streetLampUsage

              this.residentialRates[3] = residentialRates
              this.IndustrialRates[3] = IndustrialRates
              this.streetLampRates[3] = streetLampRates
            }
            if(month == "05") {
              this.residentialUsage[4] = residentialUsage
              this.IndustrialUsage[4] = IndustrialUsage
              this.streetLampUsage[4] = streetLampUsage

              this.residentialRates[4] = residentialRates
              this.IndustrialRates[4] = IndustrialRates
              this.streetLampRates[4] = streetLampRates
            }
            if(month == "06") {
              this.residentialUsage[5] = residentialUsage
              this.IndustrialUsage[5] = IndustrialUsage
              this.streetLampUsage[5] = streetLampUsage

              this.residentialRates[5] = residentialRates
              this.IndustrialRates[5] = IndustrialRates
              this.streetLampRates[5] = streetLampRates
            }
            if(month == "07") {
              this.residentialUsage[6] = residentialUsage
              this.IndustrialUsage[6] = IndustrialUsage
              this.streetLampUsage[6] = streetLampUsage

              this.residentialRates[6] = residentialRates
              this.IndustrialRates[6] = IndustrialRates
              this.streetLampRates[6] = streetLampRates
            }
            if(month == "08") {
              this.residentialUsage[7] = residentialUsage
              this.IndustrialUsage[7] = IndustrialUsage
              this.streetLampUsage[7] = streetLampUsage

              this.residentialRates[7] = residentialRates
              this.IndustrialRates[7] = IndustrialRates
              this.streetLampRates[7] = streetLampRates
            }
            if(month == "09") {
              this.residentialUsage[8] = residentialUsage
              this.IndustrialUsage[8] = IndustrialUsage
              this.streetLampUsage[8] = streetLampUsage

              this.residentialRates[8] = residentialRates
              this.IndustrialRates[8] = IndustrialRates
              this.streetLampRates[8] = streetLampRates
            }
            if(month == "10") {
              this.residentialUsage[9] = residentialUsage
              this.IndustrialUsage[9] = IndustrialUsage
              this.streetLampUsage[9] = streetLampUsage

              this.residentialRates[9] = residentialRates
              this.IndustrialRates[9] = IndustrialRates
              this.streetLampRates[9] = streetLampRates
            }
            if(month == "11") {
              this.residentialUsage[10] = residentialUsage
              this.IndustrialUsage[10] = IndustrialUsage
              this.streetLampUsage[10] = streetLampUsage

              this.residentialRates[10] = residentialRates
              this.IndustrialRates[10] = IndustrialRates
              this.streetLampRates[10] = streetLampRates
            }
            if(month == "12") {
              this.residentialUsage[11] = residentialUsage
              this.IndustrialUsage[11] = IndustrialUsage
              this.streetLampUsage[11] = streetLampUsage

              this.residentialRates[11] = residentialRates
              this.IndustrialRates[11] = IndustrialRates
              this.streetLampRates[11] = streetLampRates
            } 
          }
        }
        this.BarChart.data.datasets[0].data = this.residentialUsage
        this.BarChart.data.datasets[1].data = this.IndustrialUsage
        this.BarChart.data.datasets[2].data = this.streetLampUsage

        this.BarChart2.data.datasets[0].data = this.residentialRates
        this.BarChart2.data.datasets[1].data = this.IndustrialRates
        this.BarChart2.data.datasets[2].data = this.streetLampRates

        this.$refs.chartRef.update()
        this.$refs.chartRef2.update()
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
  }
  
}
</script>
