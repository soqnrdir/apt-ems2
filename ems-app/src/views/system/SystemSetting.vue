<template>
<div class="p-3">
  <div class="row ">
    <div class="col-md-12">
      <h5 class="fw-bold text-start">시스템 설정</h5>
      <div class="card mt-4 text-start p-2 rounded">
        <div>
          <div class="card-header">
            <h5 class="card-title fw-bold mt-2">시스템</h5>
          </div>
          <div class="card-body">
            <div class="row fs-3">
              <h5 class="col-1 fw-bold mt-2 text-end" style="flex-basis:120px">설치장소 : </h5>
              <div class="col-3">
                <input type="text" v-model="data.location" :readonly="readonly1" class="form-control">
              </div>
              <button v-if="updated1 == 'on'" type="button" class="btn btn-danger ms-auto" style="flex-basis:60px;" @click="clickCancel1">취소</button>
              <button v-if="updated1 == 'on'" type="button" class="btn btn-info ms-3 me-3" style="flex-basis:60px;" @click="clickSave1">저장</button>
              <button v-if="updated1 == 'off'" type="button" class="btn btn-primary ms-auto me-3" style="flex-basis:60px;" @click="clickUpdate1">수정</button>
            </div>
            <div class="row mt-3">
              <h5 class="col-1 fw-bold mt-2 text-end" style="flex-basis:120px">담당자 : </h5>
              <div class="col-3">
                <input type="text" v-model="data.manager"  :readonly="readonly1" class="form-control">
              </div>
            </div>
          </div>
        </div>
        <div class="mt-3">
          <div class="card-header">
            <h5 class="card-title fw-bold mt-2">전력 설정</h5>
          </div>
          <div class="card-body">
            <div class="row fs-4">
              <h5 class="col-1 fw-bold mt-2 text-end" style="flex-basis:170px">계약 전력 용량 : </h5>
              <div class="col-2">
                <input @keyup="addCommas(data.contractPower)" type="text" v-model="data.contractPower" :readonly="readonly2" class="form-control">
              </div>
              <button v-if="updated2 == 'on'" type="button" class="btn btn-danger ms-auto" style="flex-basis:60px;" @click="clickCancel2">취소</button>
              <button v-if="updated2 == 'on'" type="button" class="btn btn-info ms-3 me-3" style="flex-basis:60px;" @click="clickSave2">저장</button>
              <button v-if="updated2 == 'off'" type="button" class="btn btn-primary ms-auto me-3" style="flex-basis:60px;" @click="clickUpdate2">수정</button>
            </div>
            <div class="row mt-3">
              <h5 class="col-1 fw-bold mt-2 text-end" style="flex-basis:170px">점검 기준일 : </h5>
              <div class="col-3">
                <datepicker :disabled="dateDisabled" :style="{ backgroundColor: datebg }" class="form-control"
                  v-model="data.checkDate" :locale="locale"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="mt-3">
          <div class="card-header">
            <h5 class="card-title fw-bold mt-2">정보 연계</h5>
          </div>
          <div class="card-body">
            <div class="row fs-3">
              <h5 class="col-1 fw-bold mt-2 text-end" style="flex-basis:170px">DR 서버 주소 : </h5>
              <div class="col-3">
                <input type="text" v-model="data.drAddress" :readonly="readonly3" class="form-control">
              </div>
              <button v-if="updated3 == 'on'" type="button" class="btn btn-danger ms-auto" style="flex-basis:60px;" @click="clickCancel3">취소</button>
              <button v-if="updated3 == 'on'" type="button" class="btn btn-info ms-3 me-3" style="flex-basis:60px;" @click="clickSave3">저장</button>
              <button v-if="updated3 == 'off'" type="button" class="btn btn-primary ms-auto me-3" style="flex-basis:60px;" @click="clickUpdate3">수정</button>
            </div>
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
export default {
  components: {
    Datepicker
  },
  data () {
    return {
      locale: ko,
      nowsday: ref(new Date()),
      // 데이터 변경 시 new Date('원하는 일자')
      updated1: 'off',
      updated2: 'off',
      updated3: 'off',

      readonly1: true,
      readonly2: true,
      readonly3: true,
      dateDisabled: true,
      datebg: '#e9ecef',

      data: {}
    }
  },
  mounted () {
    this.getSystemList()
    
  },
  methods: {
    async getSystemList () {
      try {
        const res = await this.axios.get('/v1/system/all')
        this.data = res.data.records
        if(this.data.length !== 0) {
          if(this.data[0].contractPower !== null) {
            this.data[0].contractPower = this.data[0].contractPower.toString()
            .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
          }
          if(this.data[0].checkDate == null) {
            this.data[0].checkDate = moment().format('YYYY-MM-DD')
          }
        this.data[0].checkDate = ref(new Date(this.data[0].checkDate))
        }
      } catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
      this.updateData()
    },
    updateData () {
      if(this.data.length !== 0) {
        this.data = this.data[0]
      }
    },
    addCommas (x) {
      x = x.replace(/[^0-9]/g,'');   // 입력값이 숫자가 아니면 공백
      x = x.replace(/,/g,'');        // ,값 공백처리
      this.data.contractPower = x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    },
    clickUpdate1 () {
      this.updated1 = 'on'
      this.readonly1 = false
    },
    clickUpdate2 () {
      this.updated2 = 'on'
      this.readonly2 = false
      this.dateDisabled = false
      this.datebg = 'white'
    },
    clickUpdate3 () {
      this.updated3 = 'on'
      this.readonly3 = false
    },
    clickCancel1 () {
      this.updated1 = 'off'
      this.readonly1 = true
      this.getSystemList()
    },
    clickCancel2 () {
      this.updated2 = 'off'
      this.readonly2 = true
      this.dateDisabled = true
      this.datebg = '#e9ecef'
      this.getSystemList()
    },
    clickCancel3 () {
      this.updated3 = 'off'
      this.readonly3 = true
      this.getSystemList()
    },
    async clickSave1 () {
      this.updated1 = 'off'
      this.readonly1 = true

      const reqData = { ...this.data }
      delete reqData.checkDate
      delete reqData.contractPower
      delete reqData.drAddress
      delete reqData.substationcapacity
      await this.axios.put('/v1/system/update', reqData)
      this.getSystemList()
    },
    async clickSave2 () {
      this.updated2 = 'off'
      this.readonly2 = true
      this.dateDisabled = true
      this.datebg = '#e9ecef'

      const reqData = { ...this.data }
      reqData.checkDate = moment(reqData.checkDate).format('YYYY-MM-DD')
      if(reqData.contractPower !== null) {
        reqData.contractPower = parseInt(reqData.contractPower.replace(/,/g,''))
      }
      delete reqData.drAddress
      delete reqData.substationcapacity
      delete reqData.location
      delete reqData.manager
      await this.axios.put('/v1/system/update', reqData)
      this.getSystemList()

    },
    async clickSave3 () {
      this.updated3 = 'off'
      this.readonly3 = true

      const reqData = { ...this.data }
      delete reqData.checkDate
      delete reqData.contractPower
      delete reqData.substationcapacity
      delete reqData.location
      delete reqData.manager
      await this.axios.put('/v1/system/update', reqData)
      this.getSystemList()
    }
  }
}
</script>
