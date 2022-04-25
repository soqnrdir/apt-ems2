<template>
<div class="p-3">
  <div class="row ">
    <div class="col-md-12">
      <h5 class="fw-bold text-start">설비 제어</h5>
      <div class="row">
        <div class="card col-3 mt-4 text-start p-2 rounded">
          <div>
            <div class="card-header d-flex justify-content-between">
              <h5 class="card-title fw-bold mt-2">주차장 환풍기</h5>
              <button class="text-end mt-1 bg-secondary rounded-circle border-dark" style="width:30px;height:30px"></button>
            </div>
            <div class="card-body d-flex justify-content-evenly">
              <button class="btn btn-primary" style="flex-basis:120px;">상태 조회</button>
              <button type="button" class="btn btn-secondary" style="flex-basis:120px;">끄기</button>
              <button type="button" class="btn btn-danger" style="flex-basis:120px;" >켜기</button>
            </div>
          </div>
        </div>
        <div class="card col-3 ms-5 mt-5 text-start p-2 rounded">
          <div>
            <div class="card-header d-flex justify-content-between">
              <h5 class="card-title fw-bold mt-2">관리소 실외등</h5>
              <button class="text-end mt-1 bg-secondary rounded-circle border-dark" style="width:30px;height:30px"></button>
            </div>
            <div class="card-body d-flex justify-content-evenly">
              <button class="btn btn-primary" style="flex-basis:120px;">상태 조회</button>
              <button type="button" class="btn btn-secondary" style="flex-basis:120px;">끄기</button>
              <button type="button" class="btn btn-danger" style="flex-basis:120px;">켜기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>

export default {
  data () {
    return {
      // 데이터 변경 시 new Date('원하는 일자')
      updated1: 'off',
      updated2: 'off',
      updated3: 'off',

      readonly1: true,
      readonly2: true,
      readonly3: true,
      dateDisabled: true,
      datebg: '#e9ecef',

      data: {
        emplacement: '1차아파트',
        manager: '홍길동',
        contratPower: '8,000kWh',
        setDate: '',
        drServerAdd: '1.234.567.89'
      }
    }
  },
  methods: {
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
    },
    clickCancel2 () {
      this.updated2 = 'off'
      this.readonly2 = true
      this.dateDisabled = true
      this.datebg = '#e9ecef'
    },
    clickCancel3 () {
      this.updated3 = 'off'
      this.readonly3 = true
    },
    clickSave1 () {
      this.updated1 = 'off'
      this.readonly1 = true
    },
    clickSave2 () {
      this.updated2 = 'off'
      this.readonly2 = true
      this.dateDisabled = true
      this.datebg = '#e9ecef'

      const setYear = this.nowsday.getFullYear()
      let setMonth = this.nowsday.getMonth() + 1
      if (setMonth < 10) {
        setMonth = '0' + setMonth
      }
      let setDay = this.nowsday.getDay()
      if (setDay < 10) {
        setDay = '0' + setDay
      }
      let setDate = ''
      setDate = setYear + '-' + setMonth + '-' + setDay
      this.setDate = setDate
    },
    clickSave3 () {
      this.updated3 = 'off'
      this.readonly3 = true
    }
  }
}
</script>
