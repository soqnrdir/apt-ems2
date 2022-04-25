import Debug from "debug"
const debug = Debug("ems:EMS")
import { knex } from '@daos/Instance'
import { PushListener } from '@EMS/PushListener'
import { Request, Response } from 'express'
import { startStop } from "./Curoo"

export class EnergyData {
  public meterId: string
  public measurementId: string
  public facilityId: string
  public name: string       // 설비 이름
  public capacity: number // 설비 최대 용량
  public time?: Date
  public energyWh?: number  // 누적 전력량
  public energyW?: number   // 누적 전력
  public meanW?: number     // 순시 전력(평균 변화율): 두 누적 사의 값 / 두 사이 경과 시간(초)

  constructor(meterId: string, measurementId: string, facilityId: string,
    name: string, capacity: number, time: Date, energyWh: number, energyW: number, meanW: number) {
    this.meterId = meterId
    this.measurementId = measurementId
    this.facilityId = facilityId
    this.capacity = capacity
    this.name = name
    this.time = time
    this.energyWh = energyWh
    this.energyW = energyW
    this.meanW = meanW
  }
}

export class EMSChecker {
  private checkTimer : NodeJS.Timeout | null = null
  private usageListener = new PushListener()
  private energyMap = new Map<string, EnergyData>()

  constructor() {
  }

  async loadInitialData() {

  }

  async startChecker() {
    startStop(true)
    //this.checkTimer = setInterval(() => this.onTimeoutCheck(), 10000)
  }
  
  onTimeoutCheck(): void {
    this.energyMap.forEach((energyData, meterId) => {
      // TODO: timeout된 usage 데이터를 제거함
    })
  }

  //
  // 변경된 에너지 데이터를 모든 클라이언트들에게 보냄
  async updateEnergyData(meterId: string, time: Date, energyW: number): Promise<void> {
    let energyWh = Number((energyW / 3600).toFixed(2))  // 소수점 3자리 이사는 자름
    let prevData = this.energyMap.get(meterId)
    if (prevData) {
      let prevTime = prevData.time ? prevData.time : time
      let diffSecs = (time.getTime() - prevTime.getTime()) / 1000
      // 평균 변화율을 구함
      prevData.time = time
      prevData.energyWh = energyWh
      if (diffSecs >= 1) {
        if (prevData.energyW) {
          prevData.meanW = Number(((energyW - prevData.energyW) / diffSecs).toFixed(2))
        }
        //debug(`meanW: (${energyW} - ${prevData.energyW}) / ${diffSecs} = ${prevData.meanW}`)
      }
      prevData.energyW = energyW
      debug(`updateEnergyData: ${JSON.stringify(prevData)}`)
      this.notifyToListeners(prevData)
    } else {
      let facilities = await this.getFacilityRecord_(meterId)
      if (facilities.length > 0) {
        let facility = facilities[0]
        let meanW = 0  // 이전 데이터가 없음으로 순시 전력(평균 변화율)을 0으로 설정
        let energyData = new EnergyData(meterId
          , facilities['measurementId'], facility['id'], facility['name'], facility['capacity']
          , time, energyWh, energyW, meanW)
        this.energyMap.set(meterId, energyData)
        this.notifyToListeners(energyData)
      }
    }
  }

  measurementDisconnected(measurementId: string) {
    // 계측기 연결이 끊어 졌음으로 해당 장치에 연결된 데이터를 제거함
    this.energyMap.forEach((energyData, meterId) => {
      if (energyData.measurementId == measurementId) {
        delete energyData.time
        delete energyData.energyWh
        delete energyData.meanW
        delete energyData.energyW
        this.notifyToListeners(energyData)
      }
    })
  }

  //
  // 변경된 에너지 데이터를 모든 클라이언트들에게 보냄
  notifyToListeners(energyData: EnergyData): void {
    this.usageListener.sendToAll(JSON.stringify(energyData))
  }

  //
  // meter ID에 일치하는 facilities 테이블의 설비의 capacity를 얻음
  async getFacilityRecord_(meterId: string): Promise<Array<Object>> {
    let records = await knex.select({measurementId: 'measurement.id'}, {id: 'facilities.id'}, {name: 'facilities.name'}, {capacity: 'facilities.capacity'})
      .from('meters')
      .join('facilities', 'facilities.id', '=', 'meters.facilityId')
      .join('measurement', 'measurement.id', '=', 'meters.measurementId')
      .where('meters.id', meterId)
    //debug(`getCapacity_=${JSON.stringify(records)}`)
    return records
  }

  // facilities 테이블의 변경 사항을 반영한다.
  updatefacilityData(facilityId: string, name: string, capacity: number): void {
    this.energyMap.forEach((energyData, meterId) => {
      if (energyData.facilityId == facilityId) {
        energyData.name = name
        energyData.capacity = capacity
      }
    })
  }

  addListener(userId: string, clientType: string, request: Request, response: Response) {
    this.usageListener.addListener(userId, clientType, request, response)
    // 새로 추가된 client에게 전체 에너지 정보를 전달함
    this.energyMap.forEach((energyData, meterId) => this.usageListener.sendTo(JSON.stringify(energyData), response))
  }

  test(input: string) {
    console.log(`test input: ${input}`)
  }

}

var emsChecker = new EMSChecker()

export default emsChecker
