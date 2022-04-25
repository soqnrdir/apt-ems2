import { knex } from '@daos/Instance'
import UsageDao from '@daos/UsageDao'
import Usage from '@entities/Usage'
import DRUsageDao from '@daos/DRUsageDao'
import DRUsage from '@entities/DRUsage'
import MeterDao from '@daos/MeterDao'
import Debug from "debug"
const debug = Debug("ems:curoo")
import logger from '@shared/Logger'
import moment from 'moment'
import axios from 'axios'
import {API} from '../Config'
import failure from '@EMS/Failure'
import schedule from 'node-schedule'
import emsChecker from './index'
import changeNotifier from './ChangeNotifier'

const usageDao = new UsageDao()
const drusageDao = new DRUsageDao()
const meterDao = new MeterDao()

var checkMap = new Map<string, Date>()

/* DR 사업자 쿠루 연계
* 요청:
curl -v -H "Content-Type: application/json" -H "Authorization: Token d0387b3b3e94293b6d3a22328d46e83b312221b8" \
 'https://drms.curoo.co.kr/adr/usage/?customerNo=0227280812&period=300&startDateTime=20211008143000&endDateTime=20211008150000'
* 결과:
[
  {
    "customerNo": "0227280812",
    "dateTime": "20211008143500",
    "period": 300,
    "usage": 38.16,
    "peakDemand": 457.92
  },
  {
    "customerNo": "0227280812",
    "dateTime": "20211008144000",
    "period": 300,
    "usage": 27.36,
    "peakDemand": 328.32
  },
  {
    "customerNo": "0227280812",
    "dateTime": "20211008150000",
    "period": 300,
    "usage": 25.92,
    "peakDemand": 311.04
  }
]
*/
async function handleUsageResult(meterId: string, results: Array<Object>)
  : Promise<void> {

  let dataAdded = false
  // Step 1: drusage 테이블에 데이터를 추가
  for (let record of results) {
    let drUsage = new DRUsage(null)
    drUsage.customerNo = record['customerNo']
    drUsage.dateTime = moment(record['dateTime'], 'YYYYMMDDHHmmss').toDate()
    drUsage.period = record['period']
    drUsage.usage = record['usage']
    drUsage.peakDemand = record['peakDemand']
    drUsage.meterId = meterId
    try {
      debug(`drUsage add: datetime=${record['dateTime']} ${JSON.stringify(drUsage)}`)
      await drusageDao.add(drUsage)

      // Step 2: 사용량 누적을 위해 가장 최근의 데이터를 얻어옴
      let usages = await knex.select().from('usage').where('meterId', meterId).orderBy('time', 'desc').limit(1) as Array<Usage>
      let lastEnergy = usages.length > 0 ? usages[0].energy : 0

      // Step 3: 누적된 데이터를 Usage 테이블에 추가
      let usage = new Usage(null)
      usage.time = drUsage.dateTime
      let prevEnergy = lastEnergy
      usage.energy = lastEnergy + (drUsage.usage * 1000 * 3600) // drUsage.usage kWh 단위임으로 W변환을 위해 1000 * 3600을 곱함
      usage.meterId = meterId

      debug(`adding "usage": meterId=${meterId} energy=${prevEnergy}+${drUsage.usage}kW->${usage.energy} time=${moment(usage.time).format('YYYYMMDDHHmmss')}`)
      try {
        await usageDao.add(usage)
        let energyKW = Number((usage.energy / 1000).toFixed(3))
        await emsChecker.updateEnergyData(usage.meterId, usage.time as Date, energyKW)
        dataAdded = true
      } catch (e) {
        logger.warn(`Error while adding "usage": error=${e.message}`)
      }

    } catch (e) {
      logger.warn(`Error while adding "drusage": customerNo=${drUsage.customerNo} dateTime=${record['dateTime']} error=${e.message}`)
    }
  }
  if (dataAdded) {
    changeNotifier.notifyDataChang('usage')
  }
}

/**
 * CUROO http 요청해서 결과를 DB에 추가함
 * @param customerNo 
 * @returns 
 */
async function getUsage(customerNo: string, period: number, startDateTime: string, endDateTime: string, meterId: string) : Promise<void> {
  // https://drms.curoo.co.kr/adr/usage/?customerNo=0227280812&period=300&startDateTime=20211008143000&endDateTime=20211008150000
  let url =`https://drms.curoo.co.kr/adr/usage/?customerNo=${customerNo}&period=${period}&startDateTime=${startDateTime}&endDateTime=${endDateTime}`
  debug(`axios.get ${url}`)
  let res = await axios({
    url,
    method: "GET",
    headers: { Authorization: `Token ${API.curooToken}`}
    //responseType: "arraybuffer" // EUC-KR --> UTF-8 변환을 위해 필요함
  })

  let results = res.data as Array<Object>
  return handleUsageResult(meterId, results)
}

async function onSchedule() {
  let meters = await meterDao.find("type = 'Curoo'")
  //debug(`check Curoo DR: time=${moment().format('YYYY-MM-DD HH:mm:ss')} records=${meters?.length}`)
  if (meters) {
    for (let meter of meters) {
      let params = meter.address.split(':') // "customerNo:period" 형식 지정이 가능함
      let customerNo = params[0]
      let period = params.length >=2 ? parseInt(params[1]) : 300
      let usages = await knex.select().from('usage').where('meterId', meter.id).orderBy('time', 'desc').limit(1) as Array<Usage>
      let lastDT : moment.Moment | null = null
      if (usages.length > 0) {
        lastDT = moment(usages[0].time)
        //debug(`get last time: meterId=${meter.id} time=${lastDT.format('YYYY-MM-DD HH:mm:ss')}`)
        let nextCheckDT = moment(lastDT).add(period, 'second')
        if (moment().isBefore(nextCheckDT)) {
          //debug(`no need to check: time=${nextCheckDT.format('YYYY-MM-DD HH:mm:ss')}`)
          continue
        }
      } else {
        lastDT = moment().minute(0).second(0).subtract(15, 'minute')
        //debug(`start mesuring from time: meterId=${meter.id} time=${lastDT.format('YYYY-MM-DD HH:mm:ss')}`)
      }
      let errTag = 'DR연동-' + meter.id
      try {
        lastDT.add(1, 'minute') // 1분을 더해줌으로써 최종 저장된 다음 데이터 요청
        let startDateTime = lastDT.format('YYYYMMDDHHmmss')
        lastDT.add(1, 'hour')    // 최신 데이터까지 수집을 위해 시작시간 기준 1시간 이상 요구
        let endDateTime = lastDT.format('YYYYMMDDHHmmss')
        await getUsage(customerNo, period, startDateTime, endDateTime, meter.id)
        if (!checkMap.has(meter.id)) {
          checkMap.set(meter.id, new Date())
          failure.info(`DR 서버 통신 복구: 미터이름(${meter.metername})`, 'DR연동')
        }
        failure.removeDupTag(errTag)
      } catch (e) {
        debug(`Curoo data fetch error: ${e.message}`)
        failure.error(`DR 서버 통신 오류 발생: 미터이름(${meter.metername}) 오류(${e.message})`, 'DR연동', errTag)
        checkMap.delete(meter.id)
      }
    }
  }
}

var job : schedule.Job | null = null

export function startStop(isStart: boolean) {
  if (isStart) {
    // 매 분마다 20초 시점에서 수행
    job = schedule.scheduleJob('20 * * * * *', onSchedule)
  } else {
    job?.cancel()
    job = null
  }
}
