<template>
  <div class="p-3 text-start">
    <div class="row">
      <div class="card col-4 rounded p-2">
        <div class="card-header bg-gradient" :style="{backgroundColor : titleColor}">
          <h5 class="card-title text-white">현재 피크 전력</h5>
        </div>
        <div class="card-body d-flex">
          <table class="table text-center" >
            <colgroup>
              <col width = "25%">
              <col width = "25%">
              <col width = "25%">
              <col width = "25%">
            </colgroup>
            <thead>
              <tr>
                <th>측정대상</th>
                <th>전체(kW)</th>
                <th>현재(kW)</th>
                <th>용량 대비 사용량</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-white bg-primary">{{totalPowerName}}</td>
                <td>{{ totalPower }}</td>
                <td>{{ totalPowerNow }}</td>
                <td><div class="border border-primary" style="height:20px"><div class="bg-primary" style="height:19px" :style="totalPowerPer"></div></div></td>
              </tr>
              <tr>
                <td class="text-white bg-success">{{residentialPowerName}}</td>
                <td>{{ residentialPower }}</td>
                <td>{{ residentialPowerNow }}</td>
                <td><div class="border border-success" style="height:20px"><div class="bg-success" style="height:19px" :style="residentialPowerPer"></div></div></td>
              </tr>
              <tr>
                <td class="text-white bg-danger">{{industrialPowerName}}</td>
                <td>{{ industrialPower }}</td>
                <td>{{ industrialPowerNow}}</td>
                <td><div class="border border-danger" style="height:20px"><div class="bg-danger" style="height:19px" :style="industrialPowerPer"></div></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card col-8 rounded p-2">
          <div class="card-header bg-gradient" :style="{backgroundColor : titleColor}">
            <h5 class="card-title text-white">전체 전력 사용량 추세(kWh)</h5>
          </div>
          <div class="card-body" style="padding-top:0;padding-bottom:0;height:191px">
            <vue3-chart-js
                  :id="MainChart.id"
                  ref="mainchartRef"
                  :type="MainChart.type"
                  :data="MainChart.data"
                  :options="MainChart.options">
            </vue3-chart-js>
          </div>
        </div>
    </div>
    <div class="row">
      <div class="card col-4 rounded p-2">
        <div>
          <div class="card-header bg-gradient" :style="{backgroundColor : titleColor}">
            <h5 class="card-title text-white">공용부 현 사용량(%)</h5>
          </div>
          <div class="card-body" style="padding-top:0;padding-bottom:0;height:191px">
              <vue3-chart-js
                :id="pieChart.id"
                ref="piechartRef"
                :type="pieChart.type"
                :data="pieChart.data"
                :options="pieChart.options">
              </vue3-chart-js>
          </div>
        </div>
      </div>
      <div class="card col-8 rounded p-2">
        <div>
          <div class="card-header bg-gradient" :style="{backgroundColor : titleColor}">
            <h5 class="card-title text-white">공용부 전력 사용량 추세(kWh)</h5>
          </div>
          <div class="card-body">
            <vue3-chart-js
                  :id="CommonChart.id"
                  ref="subchartRef"
                  :type="CommonChart.type"
                  :data="CommonChart.data"
                  :options="CommonChart.options"
            ></vue3-chart-js>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="card col-4 rounded p-2">
        <div>
          <div class="card-header bg-gradient" :style="{backgroundColor : titleColor}">
            <h5 class="card-title text-white">주변환경</h5>
          </div>
          <div class="card-body d-flex justify-content-center ">
            <div class="col-10 text-center mt-3">
              <div class="row border mt-1">
                <div class="col-6 text-center text-white bg-primary">초미세먼지 / 미세먼지</div>               
                <div id="pmStats" class="col-6 fw-bold"><span :class="sensorPMColor1">{{sensorPMText1}}</span>{{sensorPMDiv}}<span :class="sensorPMColor2">{{sensorPMText2}}</span></div>
              </div>
              <div class="row border mt-3">
                <div class="col-6 text-center text-white bg-primary">온도 / 습도</div>
                <div id="thStats" class="col-6 fw-bold"> {{sensorTHText}} </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card col-8 rounded p-2">
        <div>
          <div class="card-header bg-gradient" :style="{backgroundColor : titleColor}">
            <h5 class="card-title text-white">시스템 알림</h5>
          </div>
          <div class="card-body d-flex">
            <div class="col-12 text-center ">
              <div class="row" v-for="(item, index) in paginatedData" :key="index">
                <div v-if="item.type == '정보'" class="col-1 border bg-primary rounded text-white ms-2" style="width:6%;">정보</div>
                <div v-else-if="item.type == '경고'" class="col-1 border bg-warning roundedtext-white ms-2" style="width:6%">경고</div>
                <div v-else class="col-1 border bg-danger rounded text-white ms-2" style="width:6%">오류</div>
                <div class="border col-2 text-center ms-1" style="background-color:#FFFACD">{{item.time}}</div>
                <div class="border col-9 text-start" style="font-size:0.9em;background-color:#FFFACD">{{item.content}}</div>
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
import moment from 'moment'
import { ref } from 'vue'

export default {
  components: {
    Vue3ChartJs
  },
  data () {
    return {
      pageNum: 0,
      pageSize: 5,
      equipFailureList: [],

      titleColor: 'yellowgreen',
      capacityData: {},
      commonList: {},
      mainMeterId: 0,
      mainMeterList: [],
      nowsday: ref(new Date()),
      lineChartDatasets: [],
      doughnutChartDatasets: [],
      barChartDatasets: [],
      subChartColor: '',
      pieIndex:0,
      pieChartList: [],
      pieChartBG: ['#FF6347', '#FF8C00', '#FFD700', '#F0E68C', '#BDB76B', '#7CFC00', '#ADFF2F', '#9ACD32', '#808000', '#3CB371', 
                   '#8FBC8F', '#90EE90', '#00FA9A', '#008080', '#4682B4', '#B0E0E6', '#1E90FF', '#000080', '#483D8B', '#FF1493'],
      pieChartLabels: [],

      mainMeterIdStr: '',
      mainMeterIdNum: 0,
      mainMeterIdName: [],
      mainMeterIdType: [],

      subMeterIdStr: '',
      subMeterIdNum: 0,
      subMeterIdName: [],
      subMeterIdType: [],

      nowsPowerName: [],

      addComm: 0,

      totalPowerName: '',
      residentialPowerName: '',
      industrialPowerName: '',

      totalPower: '',
      residentialPower: '',
      industrialPower: '',

      totalPowerNow: '',
      residentialPowerNow: '',
      industrialPowerNow: '',

      totalPowerPer: {
        width: ''
      },
      residentialPowerPer: {
        width: ''
      },
      industrialPowerPer: {
        width: ''
      },

      sse: null,
      sse2: null,
      sse3: null,
      sensorTHText: '',
      sensorPMText1: '',
      sensorPMText2: '',
      sensorPMDiv: '',
      sensorPMColor1: '',
      sensorPMColor2: '',

      count: 0,

      MainChart: {
        id: 'bar',
        type: 'bar',
        data: {
          labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
          '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
          '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
          datasets: [],
        },
        options: {
          maintainAspectRatio: false,
          showArea: false,
          axisX: {
            showGrid: false
          },
          lineSmooth: true,
          showLine: true,
          showPoint: true,
          fullWidth: true,
        }
      },
      CommonChart: {
        id: 'line',
        type: 'line',
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          maintainAspectRatio: false,
          showArea: false,
          axisX: {
            showGrid: false
          },
          lineSmooth: true,
          showLine: true,
          showPoint: true,
          fullWidth: true,
        }
      },
      pieChart: {
        id: 'doughnut',
        type: 'doughnut',
        data:{
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [],
          }]
        },
        options: {
          maintainAspectRatio: false    
        }
      }
    } 
  },
  mounted () {
    this.init()
  },
  unmounted() {
    this.sse.close()
    this.sse2.close()
    this.sse3.close()
  },
  methods: {
    async init () {
      await this.getCommonChartList()
      await this.getFacilitiesCapacity()
      this.getEgaugePushData()
      this.getSensorPushData()

      this.getMainChartList()
      this.getEquipFailureList()

      this.getNoticeChange()
    },
    getSensorPushData () {
      this.sse = new EventSource('/v1/sensor/on-data');
      const self = this // Listener 함수의 this의 컨텍트는 다르기 때문에
                      // Vue this를 저장해서 사용함
      this.sse.addEventListener("message", e => {
        // 센서값이 있는경우 예:
        //    {time: '2021-09-28T08:06:22.249Z', type: 'temp/humi', sensorId: 2, value1: 25.6, value2: 38.44}
        // 센서 Timeout으로인해 서버에서 지워진 경우 예(value1, value2 값이 없음):
        //    {type: 'temp/humi', sensorId: 2}
        let data = JSON.parse(e.data)
        if (data.type == 'temp/humi') {
          if (data.hasOwnProperty('value1'))
            self.updateTHValues(data)
          else
            self.clearTHValues()
        } 
        else if (data.type == 'PM') {
            if (data.hasOwnProperty('value1'))
              self.updatePMValues(data)
            else
              self.clearPMValues()
        } else {
          console.log('unknown sensor data:', data)
        }
      })
    },
    updateTHValues(sensorData) {
      this.sensorTHText = sensorData.value1 + 'ºC / ' + sensorData.value2 + '%'
    },
    clearTHValues() {
      this.sensorTHText = ''
    },
    updatePMValues(sensorData) {
      let pmStats1, pmStats2
      if(sensorData.value1 < 16 ) {
        pmStats1 = '좋음'
        this.sensorPMColor1 = 'text-primary'
      } else if (sensorData.value1 < 36) {
        pmStats1 = '보통'
        this.sensorPMColor1 = 'text-success'
      } else if (sensorData.value1 < 76) {
        pmStats1 ='나쁨'
        this.sensorPMColor1 = 'text-warning'
      } else {
        pmStats1 = '매우나쁨'
        this.sensorPMColor1 = 'text-danger'
      }

      if(sensorData.value2 < 31 ) {
        pmStats2 = '좋음'
        this.sensorPMColor2 = 'text-primary'
      } else if (sensorData.value2 < 81) {
        pmStats2 = '보통'
        this.sensorPMColor2 = 'text-success'
      } else if (sensorData.value2 < 151) {
        pmStats2 ='나쁨'
        this.sensorPMColor2 = 'text-warning'
      } else {
        pmStats2 = '매우나쁨'
        this.sensorPMColor2 = 'text-danger'
      }
      this.sensorPMText1 = pmStats1
      this.sensorPMDiv= ' / '
      this.sensorPMText2 = pmStats2
    },
    clearPMValues() {
      this.sensorPMText1 = ''
      this.sensorPMDiv = ''
      this.sensorPMText2 = ''
    },
    getEgaugePushData () {
      this.sse2 = new EventSource('/v1/usage/on-data');
      const self = this // Listener 함수의 this의 컨텍트는 다르기 때문에
                      // Vue this를 저장해서 사용
       this.sse2.addEventListener("message", e => {
        let data = JSON.parse(e.data)
        if(this.nowsPowerName.indexOf(data.name) !== -1) {
          if (data.hasOwnProperty('meanW'))
             self.updatePowerValues(data)
           else
             self.clearPowerValues(data)
        } else {
          if (data.hasOwnProperty('meanW')) {
            if(this.subMeterIdName.includes(data.name)) {
              self.updateCommonValues(data)
            } 
          } else {
            self.clearCommonValues(data)
          }
        }
      })
    },
    updatePowerValues (powerData) {
      let totalPowerPer = 0;
      if(powerData.name == this.totalPowerName) {
        this.totalPowerNow = powerData.meanW

        totalPowerPer = powerData.capacity / 100
        totalPowerPer = powerData.meanW / totalPowerPer

        this.totalPowerPer.width = `${totalPowerPer}%`
      } else if(powerData.name == this.residentialPowerName) {
        this.residentialPowerNow = powerData.meanW

        totalPowerPer = powerData.capacity / 100
        totalPowerPer = powerData.meanW / totalPowerPer

        this.residentialPowerPer.width = `${totalPowerPer}%`
      } else if(powerData.name == this.industrialPowerName) {
        this.industrialPowerNow = powerData.meanW

        totalPowerPer = powerData.capacity / 100
        totalPowerPer = powerData.meanW / totalPowerPer

        this.industrialPowerPer.width = `${totalPowerPer}%`
      }
    },
    clearPowerValues (powerData) {
      if(powerData.name == this.totalPowerName) {
      this.totalPowerNow = ''
      this.totalPowerPer = ''
      } else if (powerData.name == this.residentialPowerName) {
      this.residentialPowerNow = ''
      this.residentialPowerPer = ''
      } else if (powerData.name == this.industrialPowerName) {
      this.industrialPowerNow = ''
      this.industrialPowerPer = ''
      }
    },
    updateCommonValues (commonData) {
      let meanWPer = 0;
      if(this.industrialPowerNow !== '') {
        let totalComm = this.industrialPowerNow
        meanWPer = totalComm / 100
        meanWPer = commonData.meanW / meanWPer
        meanWPer = Math.round((meanWPer + Number.EPSILON) * 100) / 100
        this.addComm += meanWPer
        this.pieChartLabels.push(commonData.name)
        this.pieChartList.push(meanWPer)  
      } else {  
        this.pieChartLabels.push(commonData.name)
        this.pieChartList.push(commonData.meanW)  
      }
      if(this.pieChartList.length == this.subMeterIdName.length || (this.pieChartList.length - 1) == this.subMeterIdName.length) {
          let addCommPer = 0
          if(this.addComm !== 0) {
            addCommPer = 100 - this.addComm
            this.pieChartList.push(addCommPer)
            this.pieChartLabels.push('미측정')
          }

        this.pieChart.data.labels = this.pieChartLabels
        this.pieChart.data.datasets[0].data = this.pieChartList
        this.pieChart.data.datasets[0].backgroundColor = this.pieChartBG
        this.$refs.piechartRef.update()

        this.pieChartLabels = []
        this.pieChartList = []
        this.addComm = 0
      } 
    },
    clearCommonValues () {
      this.pieChart.data.labels = []
      this.pieChart.data.datasets[0].data = []
      this.pieChart.data.datasets[0].backgroundColor = []
      this.$refs.livechartRef.update()
    },
    async getFacilitiesCapacity () {
      try {
        const res = await this.axios.get('/v1/facilities/home-capacity')
        this.capacityData = res.data.records
        for(let i = 0; i < this.capacityData.length; i++) {
          this.capacityData[i].capacity = this.capacityData[i].capacity.toString()
         .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
            this.nowsPowerName.push(this.capacityData[i].name)
          if(this.capacityData[i].type == '메인') {
            this.totalPowerName = this.capacityData[i].name
            this.totalPower = this.capacityData[i].capacity
          } else if (this.capacityData[i].type == '변압기') {
            this.residentialPowerName = this.capacityData[i].name
            this.residentialPower = this.capacityData[i].capacity
          } else if (this.capacityData[i].type == '공용변압기') {
            this.industrialPowerName = this.capacityData[i].name
            this.industrialPower = this.capacityData[i].capacity
          }
        }
      } catch (error) {
        console.log(error.message)
      }
    },
    async getMainMeterId () {
      try {
        const res = await this.axios.get('/v1/meters/main-meterid')
        const mainMeterId = res.data.records
        this.mainMeterIdNum = mainMeterId.length
        if(mainMeterId.length == 1) {
          this.mainMeterIdStr = mainMeterId[0].id
        } else {
          this.mainMeterIdName = []
          this.mainMeterIdType = []
          for(let i = 0; i< mainMeterId.length; i++) {
            this.mainMeterIdName.push(mainMeterId[i].name)
            this.mainMeterIdType.push(mainMeterId[i].type)
            if(i == 0) {
              this.mainMeterIdStr = mainMeterId[i].id
            } else {
              this.mainMeterIdStr += ' ' + mainMeterId[i].id
            }
          }
        }
        this.mainMeterIdStr = this.mainMeterIdStr.replaceAll(' ', ',')
      } catch (error) {
        console.log(error.message)
      }
    },
    async getSubMeterId () {
      try {
        const res = await this.axios.get('/v1/meters/sub-meterid')
        const subMeterId = res.data.records
        this.subMeterIdNum = subMeterId.length
        if(subMeterId.length == 1) {
          this.subMeterIdStr = subMeterId[0].id
        } else {
          this.subMeterIdName = []
          this.subMeterIdType = []
          for(let i = 0; i< subMeterId.length; i++) {
            this.subMeterIdName.push(subMeterId[i].name)
            this.subMeterIdType.push(subMeterId[i].type)
            if(i == 0) {
              this.subMeterIdStr = subMeterId[i].id
            } else {
              this.subMeterIdStr += ' ' + subMeterId[i].id
            }
          }
        }
        this.subMeterIdStr = this.subMeterIdStr.replaceAll(' ', ',')  
      } catch (error) {
        console.log(error.message)
      }
    },
    async getMainChartList () {
      try {
        await this.getMainMeterId()

        let beginDate = moment(new Date()).startOf('day')
        let endDate = moment(new Date()).endOf('day')

        const res = await this.axios.get(`data/meters-usages?meters=${this.mainMeterIdStr}&beginDate=${beginDate.unix()}&endDate=${endDate.unix()}&freq=1H&unit=wh&fill`)
        let mainMeterList = []
        mainMeterList = res.data.data
        let index = 1;
        
        this.barChartDatasets = []
        for(let i = 0;i < this.mainMeterIdNum ; i++) {
          let colorCode = ''
          let delta = []
          let label = ''
          if(this.mainMeterIdType[i] == '메인') {
            colorCode = '#0d6efd'
            label = this.mainMeterIdName[i]
            for(let j = 0; j < mainMeterList.length; j++) {
              if(mainMeterList[j][index] !== null) {
                mainMeterList[j][index] = mainMeterList[j][index] / 1000
              }
              delta.push(mainMeterList[j][index])
            }
          } if (this.mainMeterIdType[i] == '변압기') {
            colorCode = '#198754'
            label = this.mainMeterIdName[i]
            for(let j = 0; j < mainMeterList.length; j++) {
              if(mainMeterList[j][index+2] !== null) {
                mainMeterList[j][index+2] = mainMeterList[j][index+2] / 1000
              }
            delta.push(mainMeterList[j][index+2])
            }
          } else if (this.mainMeterIdType[i] == '공용변압기') {
            colorCode = '#dc3545'
            label = this.mainMeterIdName[i]
            for(let j = 0; j < mainMeterList.length; j++) {
              if(mainMeterList[j][index+4] !== null) {
                mainMeterList[j][index+4] = mainMeterList[j][index+4] / 1000
              }
              delta.push(mainMeterList[j][index+4])
            }
          }
          if(this.totalPower.indexOf(',') !== -1) {
            delta.push(parseInt(this.totalPower.replaceAll(',','')) * 50 / 100)
          } else {
            delta.push(parseInt(this.totalPower) * 70 / 100)
          }
          this.barChartDatasets.push({label: label,backgroundColor :colorCode, data: delta, borderColor: colorCode})
        }
        this.MainChart.data.datasets = this.barChartDatasets
        this.$refs.mainchartRef.update()
      } catch (error) {
        console.log(error.message)
      }
    },
    async getCommonChartList () {
      try {
        let beginDate = moment().startOf('day')
        let endDate = moment().endOf('day')

        await this.getSubMeterId()
        const res = await this.axios.get(`data/meters-usages?meters=${this.subMeterIdStr}&beginDate=${beginDate.unix()}&endDate=${endDate.unix()}&freq=1H&unit=wh&fill`)
        
        this.commonList = []
        this.commonList = res.data.data
        this.lineChartDatasets = []
        
        let index = 1;
        let delta = []
        //let labels = []
        for(let i = 0; i < this.subMeterIdNum; i++) {
          let colorCode = "#" + Math.round(Math.random() * 0xffffff).toString(16);
          if(colorCode == "#9ACD32") {
            colorCode = "#" + Math.round(Math.random() * 0xffffff).toString(16);
          }
          this.lineChartDatasets.push({label: '',backgroundColor :this.pieChartBG[i], data: [], borderColor: this.pieChartBG[i]})
          for(let j = 0; j < this.commonList.length; j++) {
            delta = []
            if(i == 0) {
              if(this.commonList[j][index] !== null) {
                this.commonList[j][index] = this.commonList[j][index] / 1000
              }
              delta = this.commonList[j][index]
            } else {
              if(this.commonList[j][index+2] !== null) {
                this.commonList[j][index+2] = this.commonList[j][index+2] / 1000
              }
              delta = this.commonList[j][index+2]
            }
            this.lineChartDatasets[i].data.push(delta)
            this.lineChartDatasets[i].label = this.subMeterIdName[i]
          }
        }
        // for(let i = 0; i < this.commonList.length; i++) {
        //   if(this.commonList[i][index] !== null) {
        //       let divHour = ''
        //       if(i < 10) {
        //         divHour = '0' + i + ':00'
        //       } else {
        //         divHour = i +':00'
        //       }
        //       labels.push(divHour)
        //     }
        // }
        this.CommonChart.data.datasets = this.lineChartDatasets
        this.CommonChart.data.labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
         '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
         '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
        this.$refs.subchartRef.update()
      } catch (error) {
        console.log(error.message)
      }
    },
    async getEquipFailureList () {
      try {
        const res = await this.axios.get(`/v1/equipfailure/all`)
        this.equipFailureList = res.data.records
        for (let i = 0; i < this.equipFailureList.length; ++i) {
          this.equipFailureList[i].time = moment(this.equipFailureList[i].time).format('YYYY/MM/DD HH:mm:ss')
          if(this.equipFailureList[i].type == '정보') {
            this.equipFailureList[i].borderColor = 'blue'
            this.equipFailureList[i].backgroundColor = 'blue'
          } else if(this.equipFailureList[i].type == '경고') {
            this.equipFailureList[i].borderColor = 'yello'
            this.equipFailureList[i].backgroundColor = 'yello'
          } else {
            this.equipFailureList[i].borderColor = 'red'
            this.equipFailureList[i].backgroundColor = 'red'
          }
        }
      } catch (error) {
        console.log(error.message)
      }
    },
    getNoticeChange () {
      this.sse3 = new EventSource('/v1/noti/on-data-change');
      const self = this // Listener 함수의 this의 컨텍트는 다르기 때문에
                      // Vue this를 저장해서 사용함
      this.sse3.addEventListener("message", e => {
        // 센서값이 있는경우 예:
        //    {time: '2021-09-28T08:06:22.249Z', type: 'temp/humi', sensorId: 2, value1: 25.6, value2: 38.44}
        // 센서 Timeout으로인해 서버에서 지워진 경우 예(value1, value2 값이 없음):
        //    {type: 'temp/humi', sensorId: 2}
        let data = JSON.parse(e.data)
        if(data.type == 'data-change') {
          if(data.data == 'equipfailure') {
          this.getEquipFailureList()
          } else if (data.data == 'usage') {
            this.getMainChartList()
            this.getCommonChartList()
          }
        }
      })
    }
  },
  computed: {
    paginatedData () {
      const start = this.pageNum * this.pageSize
      const end = start + this.pageSize
      return this.equipFailureList.slice(start, end)
    }
  }
}
</script>
