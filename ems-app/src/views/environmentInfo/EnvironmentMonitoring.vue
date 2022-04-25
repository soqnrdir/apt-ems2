 <template>
  <div class="p-3">
    <div class="row">
    <div class="col-md-12">
      <h5 class="fw-bold text-start">환경 모니터링</h5>
      <div class="card mt-4">
        <div class="card-body">
          <div class="row">
            <div class="col-2">
              <select class="form-select" v-model="sensorId">
                <option :key="i" :value="d.id" v-for="(d, i) in sensors">{{ d.sensorName }}</option>
              </select>
            </div>
            <div class="col-2">
              <datepicker class="form-control bg-white" v-model="nowsday" :locale="locale"/>
            </div>
            <button type="button" class="btn btn-info ms-auto me-3 text-white" style="flex-basis:110px;" @click="updateChart">&#8634;새로고침</button>
          </div>
          <div class="row justify-content-center">
            <div class="col-8">
              <h5 class="fw-bold text-center">환경 정보</h5>
              <vue3-chart-js v-if="sensorId == '2'"
                  :id="lineChart.id"
                  ref="chartRef"
                  :type="lineChart.type"
                  :data="lineChart.data"
                  :options="lineChart.options"
              ></vue3-chart-js>
              <vue3-chart-js v-else
                  :id="lineChart2.id"
                  ref="chartRef2"
                  :type="lineChart2.type"
                  :data="lineChart2.data"
                  :options="lineChart2.options"
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
      sensorId: '1',
      sensors: [],
      sensorIdNum: 0,
      sensorIdName: [],

      environmentList: {},
      pmDatasets: [],
      thDatasets: [],

      lineChart: {
        id: 'line',
        type: 'line',
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          showArea: false,
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
      },

      lineChart2: {
        id: 'line',
        type: 'line',
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          showArea: false,
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

    }
  },
  watch : {
    sensorId: 'getEnvironmentList',
    nowsday : 'getEnvironmentList',
  },
  async mounted () {
    await this.getSensorList() 
    this.getEnvironmentList()
  },
  methods: {
    updateChart() {
      this.getEnvironmentList()
    },
    async getSensorList () {
      try {
        const res = await this.axios.get('/v1/sensor/all')
        this.sensors = res.data.records
        this.sensorIdNum = this.sensors.length
        for(let i = 0; i< this.sensorIdNum; i++) {
          this.sensorIdName.push(this.sensors[i].sensorName)
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
    async getEnvironmentList () {
      try {
        let beginDate = moment(this.nowsday).startOf('day')
        let endDate = moment(this.nowsday).endOf('day')

        const res = await this.axios.get(`/data/environments?sensorId=${this.sensorId}&beginDate=${beginDate.unix()}&endDate=${endDate.unix()}&freq=1H&fill`)
        this.environmentList = res.data.data
        let index = 0;
        let delta = []

        if(this.sensorId == '1') {
          this.pmDatasets = []
          for(let i = 0; i < this.sensorIdNum; i++) {
            this.pmDatasets.push({label: '',backgroundColor :'', data: [], borderColor: ''})
            for(let j = 0; j < this.environmentList.length; j++) {
              
              delta = []
              if( i == 0) {
                delta = this.environmentList[j][index]
              } else {
                delta = this.environmentList[j][index+1]
              }
              this.pmDatasets[i].data.push(delta)
              if(i == 0) {
                this.pmDatasets[i].label = '초미세먼지'
                this.pmDatasets[i].backgroundColor = 'green'
                this.pmDatasets[i].borderColor = 'green'
              } else {
                this.pmDatasets[i].label = '미세먼지'
                this.pmDatasets[i].backgroundColor = 'blue'
                this.pmDatasets[i].borderColor = 'blue'
              }
            }
          }
          this.lineChart2.data.datasets = this.pmDatasets
          this.lineChart2.data.labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
          '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
          '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
          this.$refs.chartRef2.update()
        } else {
          this.thDatasets = []
          for(let i = 0; i < this.sensorIdNum; i++) {
            this.thDatasets.push({label: '',backgroundColor :'', data: [], borderColor: ''})
            for(let j = 0; j < this.environmentList.length; j++) {
              
              delta = []
              if( i == 0) {
                delta = this.environmentList[j][index]
              } else {
                delta = this.environmentList[j][index+1]
              }
              this.thDatasets[i].data.push(delta)
              if(i == 0) {
                this.thDatasets[i].label = '온도'
                this.thDatasets[i].backgroundColor = 'red'
                this.thDatasets[i].borderColor = 'red'
              } else {
                this.thDatasets[i].label = '습도'
                this.thDatasets[i].backgroundColor = 'orange'
                this.thDatasets[i].borderColor = 'orange'
              }
            }
          }
          this.lineChart.data.datasets = this.thDatasets
          this.lineChart.data.labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
          '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
          '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
          this.$refs.chartRef.update()
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
  }
}
</script>
