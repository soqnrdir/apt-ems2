import { knex } from '@daos/Instance'
import UsageDao from '@daos/UsageDao'
import Usage from '@entities/Usage'
import {parseStringPromise} from 'xml2js'
import Debug from "debug"
const debug = Debug("ems:egauge")
import logger from '@shared/Logger'
import moment from 'moment'
import axios from 'axios'
import emsChecker from './index'
import {API} from '../Config'
import failure from '@EMS/Failure'

const usageDao = new UsageDao()

/*
* egauge push data를 DB에 넣는다.
* 수신 데이터 예:
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE group PUBLIC "-//ESL/DTD eGauge 1.0//EN" "http://www.egauge.net/DTD/egauge-hist.dtd">
<group serial="0x2a">
<data columns="3" time_stamp="0x612115a4" time_delta="60" epoch="0x611f5110">
 <cname t="P" did="0">SW3-전체</cname>
 <cname t="P" did="1">SW3-센서1+</cname>
 <cname t="P" did="2">SW3-센서2+</cname>
 <r><c>-9964805</c><c>232854119</c><c>81294524</c></r>
</data>
</group>

--> 파싱 결과: (속성은 $ 값안에 포함됨)
{
  "group": {
    "$": {
      "serial": "0x2a"
    },
    "data": [
      {
        "$": {
          "columns": "3",
          "time_stamp": "0x612115a4",
          "time_delta": "60",
          "epoch": "0x611f5110"
        },
        "cname": [
          {
            "_": "SW3-전체",
            "$": {
              "t": "P",
              "did": "0"
            }
          },
          {
            "_": "SW3-센서1+",
            "$": {
              "t": "P",
              "did": "1"
            }
          },
          {
            "_": "SW3-센서2+",
            "$": {
              "t": "P",
              "did": "2"
            }
          }
        ],
        "r": [
          {
            "c": [
              "-9964805",
              "232854119",
              "81294524"
            ]
          }
        ]
      }
    ]
  }
}
*/
export async function handlePushData(regNo: string, xmlData: string, realtimeData: boolean)
  : Promise<number> {

  let parsed = await parseStringPromise(xmlData)
  let serial = parsed['group']['$']['serial']
  let data = parsed['group']['data'][0]
  let dataAttr = data['$'] // {"columns":"3","time_stamp":"0x612115a4","time_delta":"60","epoch":"0x611f5110"
  let cname = data['cname']

  console.log(`serial=${serial} dataAttr=${JSON.stringify(dataAttr)} cname=${JSON.stringify(cname)}`)

  // Step 1: DB에 등록된 meterId와 레지스터 이름을 얻어와서 insert할 컬럼과 meterId를 구한다.
  let registerNames = cname.map(r => r['_'])
  let idPairs = await knex.select(['id', 'address', 'metername']).from('meters').whereIn('address', registerNames)
  let colums : Array<Array<any>> = []
  for (let col = 0; col < registerNames.length; ++col) {
    for (let j = 0; j < idPairs.length; j++) {
      if (registerNames[col] === idPairs[j]['address']) {
        colums.push([col, idPairs[j]['id'], idPairs[j]['metername'] ])
        break
      }
    }
  }

  let warningTag = `레지스터미등록: ${regNo}`
  if (colums.length == 0) {
    let msg = `egauge data update: register name not registered(registerNames=${registerNames})`
    debug(msg)
    logger.warn(msg)
    failure.warning(`EGAUGE 장치의 레지스터값 일치되는 항목이 없습니다.: 관리번호(${regNo})`, '계측기', warningTag)
    debug(xmlData)
    return -1
  }
  failure.removeDupTag(warningTag)

  // Step 2: DB에 등록된 미터기와 일치하는 레지스터 값을 저장함
  // - egauge 장치가 push를 못한경우 가지고 있다 통신이 재개되면 push하며 최대 가지고 있는 데이터 갯수는 900임
  let baseTimestamp = parseInt(dataAttr['time_stamp'])
  let deltaSecs = parseInt(dataAttr['time_delta'])
  let records = data['r']
  if (!records) {
    debug(`egauge data update: no records exist(registerNames=${registerNames})`)
    return -1
  }

  let timeErrorTag = 'Time error:' + regNo
  if (realtimeData) {
    let baseTime = moment(new Date(baseTimestamp * 1000))
    let hostTime = moment()
    var limitTime = moment(hostTime).add(10, 'minute')
    if (baseTime.isAfter(limitTime)) { // 서버 시간과 차이가 나는 경우 데이터 적용을 하지 않음
      debug(`egauge time is wrong: regNo=${regNo} deviceTime=${baseTime.format('YYYY-MM-DD HH:mm:ss')} hostTime=${hostTime.format('YYYY-MM-DD HH:mm:ss')}`)
      failure.error(`EGAUGE 계측기 시간과 서버 시간 차이때문에 데이터를 수집을 할수 없습니다.: 관리번호(${regNo}) 계측기시간(${baseTime.format('YYYY-MM-DD HH:mm:ss')}`
        , '계측기', timeErrorTag)
      return -1
    }
  } else {
    failure.removeDupTag(timeErrorTag)
  }

  let recentUsages : Array<Usage> = []
  for (var i = 0; i < records.length; ++i) {
    // 레코드가 여러개인경우는 가장 최근의 데이터가 먼저오는 내림차순으로 다음 레코드의 기록 시간은 time_delta 만큼 빼줘야됨
    // - 'time_stamp' 값은 UTC 기준으로 egage 장치에서 Timezone 적용해도 이상없음
    let recordTime = new Date((baseTimestamp - (deltaSecs * i)) * 1000)
    let record = records[i]
    for (let item of colums) {
      let usage = new Usage(null)
      usage.energy = parseInt(record['c'][item[0]])
      if (usage.energy < 0) {
        usage.energy = -usage.energy
      }
      usage.time = recordTime
      usage.meterId = item[1]
      let meterName = item[2]
      if (i == 0) {
        recentUsages.push(usage)
      }
      debug(`usageList ${JSON.stringify(usage)}`)
      //debug(`[${i}] usageDao.add: meterName=${meterName} energy=${usage.energy} recordTime=${recordTime.toString()} time=${moment(usage.time).format('YYYY-MM-DD HH:mm:ss')} meterId=${usage.meterId}`)
      try {
        await usageDao.add(usage)
      } catch (e) {
        logger.warn(`Error while egauge data update: regNo=${regNo} error=${e.message}`)
      }
    }
  }

  for (let usage of recentUsages) {
    let energyKW : number
    if (API.forceKWEnergy) {
      energyKW = usage.energy
    } else {
      energyKW = Number((usage.energy / 1000).toFixed(3))
    }
    await emsChecker.updateEnergyData(usage.meterId, usage.time as Date, energyKW)
  }
  return records.length
}

/**
 * egauge http 요청해서 결과를 DB에 추가함
 * @param regNo 
 * @param url : http://192.168.5.31/cgi-bin/egauge-show?m&c&f=1629542520&t=1629542280
 * @returns 
 */
export async function getEgaugeShow(regNo: string, url: string) : Promise<number> {
  debug(`axios.get ${url}`)
  let res = await axios({
    url,
    method: "GET",
    responseType: "arraybuffer" // EUC-KR --> UTF-8 변환을 위해 필요함
  })

  let text = res.data.toString()
  //debug(text)
  return handlePushData(regNo, text, false)
}
