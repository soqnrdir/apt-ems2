import { Request, Response, Router } from 'express'
import Debug from "debug"
import { gunzipSync } from 'zlib'
import { handlePushData } from '../EMS/Egauge'
import failure from '@EMS/Failure'
import MeasurementDao from '@daos/MeasurementDao'
import emsChecker from '../EMS/'
import changeNotifier from '@EMS/ChangeNotifier'

const debug = Debug("ems:egauge")
const router = Router()

const measurementDao = new MeasurementDao()

// egauge 계측기가 1분단위로 데이터를 push함으로
// 2분 30초 타임아웃을 줌
const egaugeTimeoutMS = 150 * 1000

class MeasurementInfo {
  public id: string
  public regNo: string
  public name: string
  public ip: string
  public accessTime: Date

  constructor(id: string, regNo: string, name: string, ip: string) {
    this.id = id
    this.regNo = regNo
    this.name = name
    this.ip = ip
    this.accessTime = new Date()
  }
}

var egaugeMap = new Map<string, MeasurementInfo>()

// 주기적으로 egauge 데이터가 들어왔는지를 체크함
setInterval(() => {
  const nowMS = new Date().getTime()
  egaugeMap.forEach((info, regId) => {
    if (nowMS - info.accessTime.getTime() > egaugeTimeoutMS) {
      debug(`measurement timeout: regNo=${info.regNo} name=${info.name}`)
      failure.error(`EGAUGE 계측기 통신 불량 발생: 이름(${info.name}) IP(${info.ip})`, '계측기')
      emsChecker.measurementDisconnected(info.id)
      egaugeMap.delete(regId)
    }
  })
}, 10000)

// "GET /v1/egauges/push-data"
/*
* egauge push data를 받아서 DB에 넣는 동작을 수행한다.
*/
router.post('/push-data', async (req: Request, res: Response) => {
  let regNo : string = req.query.id as string || ''
  let chunks: Array<Buffer> = []
  let proxyRemoteIp = req.headers['x-forwarded-for']
  let remoteIp = proxyRemoteIp || req.socket.remoteAddress?.split(':').pop() // '::ffff:192.168.5.26'.split(':').pop()

  if (!regNo) {
    debug('/push-data: egauge acess without id');
    failure.warning(`등록되지않은 EGAUGE 장치 접근입니다.(id 인자 없음): IP(${remoteIp})`, '계측기', remoteIp as string)
    res.sendStatus(200)
    return
  }

  let measurement = await measurementDao.findOne('regNo', regNo)
  if (!measurement) {
    debug(`/push-data: unregistered : regNo=${regNo}`);
    failure.warning(`등록되지않은 EGAUGE 장치 접근입니다: 관리번호(${regNo})`, '계측기', regNo)
    res.sendStatus(200)
    return
  }
  failure.removeDupTag(regNo)

  let egaugeInfo = egaugeMap.get(regNo)
  if (egaugeInfo) {
    // egauge 접근 시간을 갱신해서 timeout이 발생되지 않게함
    egaugeInfo.accessTime = new Date()
  } else {
    let info = new MeasurementInfo(measurement.id, regNo, measurement.measureName, remoteIp as string)
    egaugeMap.set(regNo, info)
    failure.info(`EGAUGE 계측기 통신 복구: 이름(${info.name}) IP(${remoteIp})`, '계측기')
  }

  req.on('data', (data: Buffer) => {
    //debug('data:', data)
    chunks.push(data)
  })

  req.on('end', async () => {
    debug(`data colleced: content-encoding=${req.headers['content-encoding']} numChunk=${chunks.length}`);
    let wholeData = Buffer.concat(chunks)
    let text : string
    if (req.headers['content-encoding'] == 'gzip')
      text = gunzipSync(wholeData).toString()
    else
      text = wholeData.toString()
    //debug(text)
    if (await handlePushData(regNo, text, true) > 0) {
      changeNotifier.notifyDataChang('usage')
    }

    res.sendStatus(200)
  })

  req.on('error', e => {
    debug("ERROR ERROR:", e.message)
    res.sendStatus(500)
  })

})

export default router
