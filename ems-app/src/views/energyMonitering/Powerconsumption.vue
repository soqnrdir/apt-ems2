 <template>
  <div class="p-3">
    <div class="row">
      <div class="col-md-12">
        <h5 class="fw-bold text-start">설비별 전력 사용량</h5>
        <div class="card mt-4">
          <div class="card-body">
            <div class="row">
              <div class="col-2">
                <select @change="meterChange" class="form-select" v-model="meterId" id="meter-text">
                  <option :key="i" :value="d.id" v-for="(d, i) in meters">{{d.name}}</option>
                </select>
              </div>
              <div v-if="selectDiv =='day'" class="col-1">
                <datepicker class="form-control bg-white" v-model="nowsday"  :locale="locale"/>
              </div>
              <div v-else-if="selectDiv =='week'" class="col-1">
                <datepicker class="form-control bg-white" v-model="nowsweek" :locale="locale"/>
              </div>
              <div v-else-if="selectDiv =='month'" class="col-1">
                <datepicker class="form-control bg-white" v-model="nowsmonth" inputFormat='yyyy-MM' startingView='month' minimumView='month' monthHeadingFormat='yyyy-MM' :locale="locale"/>
              </div>
              <div v-else class="col-1">
                <datepicker class="form-control bg-white" v-model="nowsyear" inputFormat='yyyy' startingView='year' minimumView='year' monthHeadingFormat='yyyy' :locale="locale"/>
              </div>
              <button type="button" :class="selectDay" style="flex-basis:80px;"  ref="day" @click="updateChartDay">1일</button>
              <button type="button" class="ms-1" :class="selectWeek" style="flex-basis:80px;" ref="week" @click="updateChartWeek">1주일</button>
              <button type="button" class="ms-1" :class="selectMonth" style="flex-basis:80px;" ref="month" @click="updateChartMonth">1개월</button>
              <button type="button" class="ms-1" :class="selectYear" style="flex-basis:80px;" ref="year" @click="updateChartYear">1년</button>
              <button type="button" class="btn btn-info ms-auto me-3 text-white" style="flex-basis:110px;" @click="updateReload">&#8634;새로고침</button>
            </div>
            <div class="row justify-content-center">
              <div class="col-8">
                <h5 class="fw-bold text-center mt-2">전력 사용량(kWh)</h5>
                <vue3-chart-js
                    :id="BarChart.id"
                    ref="usagechartRef"
                    :type="BarChart.type"
                    :data="BarChart.data"
                    :options="BarChart.options"
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
      selectDiv: '',
      userList: [],
      selectDay: 'text-white bg-primary',
      selectWeek: 'text-dark bg-white',
      selectMonth: 'text-dark bg-white',
      selectYear: 'text-dark bg-white',
      locale: ko,
      meterId: 0,

      userList: {},
      meters: [],
      nowsday: ref(new Date()),
      nowsweek: ref(new Date()),
      nowsmonth: ref(new Date()),
      nowsyear: ref(new Date()),

      weekfrom: '',
      weekto: '',

      BarChart: {
        id: 'bar',
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false
            }
          },
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
    }
  },
  mounted () {
    this.getMeterList()
    this.getUsageList()
    // this.getList()
    // this.getUsageListTest()
  },
  watch: {
    nowsday: 'updateChartDay',
    nowsweek: 'setWeekFromToWatch',
    nowsmonth: 'updateChartMonth',
    nowsyear: 'updateChartYear'
  },
  methods: {
    meterChange() {
      if(this.selectDiv == 'day') {
        this.updateChartDay()
      } else if(this.selectDiv == 'week') {
        this.updateChartWeek()
      } else if(this.selectDiv == 'month') {
        this.updateChartMonth()
      } else {
        this.updateChartYear()
      }
    },
    // async getList () {
    //   try {
    //     const res = await this.axios.get('v1/tests/egauge-month-data?date=2021-08-01&addr=jaguar40589.jaguariotmeters.net')
    //      console.log(res.data.records)
        
    //   } catch (error) {
    //     console.log(error)
    //     alert('load error: ' + error.message)
    //   }
    // },
    // async getUsageListTest () {
    //   try {
    //     const res = await this.axios.get('v1/usage/all')
    //      console.log('testUsage',res.data.records)
        
    //   } catch (error) {
    //     console.log(error)
    //     alert('load error: ' + error.message)
    //   }
    // },
    async getMeterList () {
      try {
        const res = await this.axios.get('/v1/meters/search-facilityId')
        this.meters = res.data.records
        if(this.meters.length !== 0) {
          this.meterId = this.meters[0].id
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
    async getUsageList () {
      try {
        if(this.meterId == 0) {
          await this.getMeterList()
        }

        let beginDate = ''
        let endDate = ''
        let freq = 0;

        if(this.selectDiv == 'day' || this.selectDiv == '') {
          freq = '1H'
          beginDate = moment(this.nowsday).startOf('day')
          endDate = moment(this.nowsday).endOf('day')
        }else if(this.selectDiv == 'week') {
          freq = '1D'
          beginDate = moment(this.weekfrom)
          endDate = moment(this.weekto)
        } else if(this.selectDiv == 'month') {
          freq = '1D'
          beginDate = moment(this.nowsmonth).startOf('month')
          endDate = moment(this.nowsmonth).endOf('month')
        } else {
          freq = '1M'
          beginDate = moment(this.nowsmonth).startOf('year')
          endDate = moment(this.nowsmonth).endOf('year')
        }
        const res = await this.axios.get(`/data/usages?meterId=${this.meterId}&beginDate=${beginDate.unix()}&endDate=${endDate.unix()}&unit=wh&freq=${freq}&fill`)
        const usageList = res.data
        this.userList = []

        for(let i = 0; i < usageList.data.length; i++) {
          let delta = usageList.data[i][1]
          delta = delta / 1000
          this.userList.push(delta)
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
      if(this.selectDiv == '') {
        this.updateChartDayEmpty()
      }
    },
    async updateChartDayEmpty () {
      this.selectDiv = 'day'

      this.selectDay = 'text-white bg-primary'
      this.selectWeek = 'text-dark bg-white'
      this.selectMonth = 'text-dark bg-white'
      this.selectYear = 'text-dark bg-white'

      this.BarChart.data.labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
      this.BarChart.data.datasets = [
        {
          backgroundColor: [
            '#DAA520'
          ],
          data: this.userList,
          borderColor: '#DAA520'
        }
      ]
      this.$refs.usagechartRef.update()
    },
    async updateChartDay () {
      this.selectDiv = 'day'

      await this.getUsageList()

      this.selectDay = 'text-white bg-primary'
      this.selectWeek = 'text-dark bg-white'
      this.selectMonth = 'text-dark bg-white'
      this.selectYear = 'text-dark bg-white'

      this.BarChart.data.labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
      this.BarChart.data.datasets = [
        {
          backgroundColor: [
            '#DAA520'
          ],
          data: this.userList,
          borderColor: '#DAA520'
        }
      ]
      this.$refs.usagechartRef.update()
    },
   async updateChartWeek () {
      this.setWeekFromTo()
      this.selectDiv = 'week'

      await this.getUsageList()

      this.selectDay = 'text-dark bg-white'
      this.selectWeek = 'text-white bg-primary'
      this.selectMonth = 'text-dark bg-white'
      this.selectYear = 'text-dark bg-white'

      this.BarChart.data.labels = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
      this.BarChart.data.datasets = [
        {
          backgroundColor: [
            '#DAA520'
          ],
          data: this.userList,
          borderColor: '#DAA520'
        }
      ]
      this.$refs.usagechartRef.update()
    },
    async updateChartMonth () {
       this.selectDiv = 'month'

      await this.getUsageList()

      this.selectDay = 'text-dark bg-white'
      this.selectWeek = 'text-dark bg-white'
      this.selectMonth = 'text-white bg-primary'
      this.selectYear = 'text-dark bg-white'

      this.BarChart.data.labels = ['1', '2', '3', '4', '5', '6', '7','8','9','10'
                            , '11', '12', '13', '14', '15', '16', '17','18','19','20'
                            , '21', '22', '23', '24', '25', '26', '27','28','29','30','31'
                             ]
      this.BarChart.data.datasets = [
        {
          backgroundColor: [
            '#DAA520'
          ],
          data: this.userList,
          borderColor: '#DAA520'
        }
      ]
      this.$refs.usagechartRef.update()
    },
    async updateChartYear () {
      this.selectDiv = 'year'

      await this.getUsageList()

      this.selectDay = 'text-dark bg-white'
      this.selectWeek = 'text-dark bg-white'
      this.selectMonth = 'text-dark bg-white'
      this.selectYear = 'text-white bg-primary'

      this.BarChart.data.labels = ['1월', '2월', '3월', '4월', '5월', '6월'
                            , '7월','8월','9월','10월', '11월', '12월']
      this.BarChart.data.datasets = [
        {
          backgroundColor: [
            '#DAA520'
          ],
          data: this.userList,
          borderColor: '#DAA520'
        }
      ]
      this.$refs.usagechartRef.update()
    },
    updateReload () {
      this.meterChange()
    },
    setWeekFromTo () {
      let nowsweek = this.nowsweek
      let nowsweekfrom = new Date(this.nowsweek)
      let nowsweekto = new Date(this.nowsweek)

      const week = ['일', '월', '화', '수', '목', '금', '토'];
      const dayOfWeek = week[nowsweek.getDay()];
      if(dayOfWeek == '일') {
        this.weekfrom = moment(nowsweek).format('YYYY-MM-DD')
        this.weekto = moment(nowsweekto.getTime()).add("6", "d").format('YYYY-MM-DD')
      } else if(dayOfWeek == '월') {
        this.weekfrom = moment(nowsweekfrom.getTime()).add("-1", "d").format('YYYY-MM-DD')
        this.weekto = moment(nowsweekto.getTime()).add("5", "d").format('YYYY-MM-DD')
      } else if(dayOfWeek == '화') {
        this.weekfrom = moment(nowsweekfrom.getTime()).add("-2", "d").format('YYYY-MM-DD')
        this.weekto = moment(nowsweekto.getTime()).add("4", "d").format('YYYY-MM-DD')
      } else if(dayOfWeek == '수') {
        this.weekfrom = moment(nowsweekfrom.getTime()).add("-3", "d").format('YYYY-MM-DD')
        this.weekto = moment(nowsweekto.getTime()).add("3", "d").format('YYYY-MM-DD')
      } else if(dayOfWeek == '목') {
        this.weekfrom = moment(nowsweekfrom.getTime()).add("-4", "d").format('YYYY-MM-DD')
        this.weekto = moment(nowsweekto.getTime()).add("2", "d").format('YYYY-MM-DD')
      } else if(dayOfWeek == '금') {
        this.weekfrom = moment(nowsweekfrom.getTime()).add("-5", "d").format('YYYY-MM-DD')
        this.weekto = moment(nowsweekto.getTime()).add("1", "d").format('YYYY-MM-DD')
      } else {
        this.weekfrom = moment(nowsweekto.getTime()).add("-6", "d").format('YYYY-MM-DD')
        this.weekto = moment(nowsweek).format('YYYY-MM-DD')
      }
    },
    setWeekFromToWatch () {
      this.setWeekFromTo()
      this.updateChartWeekWatch()
    },
     async updateChartWeekWatch () { 
      this.selectDiv = 'week'

      await this.getUsageList()

      this.selectDay = 'text-dark bg-white'
      this.selectWeek = 'text-white bg-primary'
      this.selectMonth = 'text-dark bg-white'
      this.selectYear = 'text-dark bg-white'

      this.BarChart.data.labels = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
      this.BarChart.data.datasets = [
        {
          backgroundColor: [
            '#DAA520'
          ],
          data: this.userList,
          borderColor: '#DAA520'
        }
      ]
      this.$refs.usagechartRef.update()
    },
  }
}
</script>
