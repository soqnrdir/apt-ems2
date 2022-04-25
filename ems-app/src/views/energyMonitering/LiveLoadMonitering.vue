<template>
  <div class="p-3">
    <div class="row">
      <div class="col-md-12">
        <h5 class="fw-bold text-start">실시간 부하 모니터링</h5>
        <div class="card mt-4">
          <div class="card-body">
            <div class="row justify-content-center">
              <div class="col-8">
                <vue3-chart-js
                    :id="liveChart.id"
                    ref="livechartRef"
                    :type="liveChart.type"
                    :data="liveChart.data"
                    :options="liveChart.options"
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
// import Datepicker from 'vue3-datepicker'
import { ref } from 'vue'

export default {
  name: 'App',
  components: {
    Vue3ChartJs
    // Datepicker
  },
  data () {
    return {
      sse: null,
      facilitesId: [],
      facilityData: [],
      chartCount: 0,

      liveChart: {
        id: 'bar',
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            axis: 'y',
            label: '현재사용량(kW)',
            backgroundColor: [
              '#32CD32'
            ],
            data: [],
            borderColor: '#32CD32'
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
        },
        indexAxis: 'y'
      }
      }
    }
  },
  mounted () {
    this.init()
  },
  unmounted() {
    this.sse.close()
  },
  methods: {
    async init () {
      await this.getFacilityList()
      this.getEgaugePushData()
    },
    async getFacilityList () {
      try {
        const res = await this.axios.get('/v1/facilities/all')
        this.liveChart.data.labels = []
        for(var i = 0;i<res.data.records.length;i++) {
          this.facilitesId.push(res.data.records[i].id)
          this.facilityData.push(0) // 측정데이터 초기값 설정
          this.liveChart.data.labels.push(res.data.records[i].name)
        }
        this.$refs.livechartRef.update()
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
    },
    getEgaugePushData () {
      this.sse = new EventSource('/v1/usage/on-data');
      const self = this // Listener 함수의 this의 컨텍트는 다르기 때문에
                      // Vue this를 저장해서 사용
      this.sse.addEventListener("message", e => {
        let data = JSON.parse(e.data)
          if (data.hasOwnProperty('meanW')) {
            self.updatePowerValues(data)
          } else {
            self.clearPowerValues(data)
          }
      })
    },
    updatePowerValues (powerData) {
      for (let i = 0; i < this.facilitesId.length; ++i) {
        if (this.facilitesId[i] == powerData.facilityId) {
          this.facilityData[i] = powerData.meanW
          this.liveChart.data.datasets[0].data = this.facilityData
          this.$refs.livechartRef.update()
        }
      }
      /*
      this.liveChartLabels.push(powerData.name)
      this.liveChartList.push(powerData.meanW)  
      if(this.liveChartList.length == this.chartCount) {
                    
        this.liveChart.data.labels = this.liveChartLabels
        this.liveChart.data.datasets[0].data = this.liveChartList
        this.$refs.livechartRef.update()

        this.liveChartLabels = []
        this.liveChartList = []
        this.chartCount = 0;
      }
      */
    },
    clearPowerValues () {
      this.liveChart.data.labels = []
      this.liveChart.data.datasets[0].data = []
      this.$refs.livechartRef.update()
    },
  }
}
</script>
