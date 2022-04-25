import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { RequestWithAuth } from '../Middleware'
import { MakeCRUDRoutes } from './RouteUtil'

import SensorDao from '@daos/SensorDao'
import { paramMissingError } from '@shared/constants'
import Debug from 'debug'
const debug = Debug("ems:sensor")
import logger from '@shared/Logger'
import moment from 'moment';
import { knex } from '@daos/Instance'
import { PushListener } from '@EMS/PushListener'
import failure from '@EMS/Failure'

const router = Router()
const sensorDao = new SensorDao()
const sensorDataCheckMS = 5000
const sensorThresholdMS = 300000 // 센서 타임아웃 체크 밀리초
var sensorListener = new PushListener()
var sensorMap = {}

// 주기적으로 센서 데이터가 안들어왔는지를 체크해서
// 오래된 데이터는 삭제하고 클라이언트들에게 데이터 없음을 알린다.
setInterval(() => {
  const nowMS = new Date().getTime()
  for (const sensorId in sensorMap) {
    let sensorData = sensorMap[sensorId]
    if (nowMS - sensorData.time.getTime() > sensorThresholdMS) {
      failure.error(`환경 센서 통신 불량 발생: ID(${sensorData.sensorId}) 타입(${sensorData.type})`, '환경센서')
      debug(`sensor timeout: type=${sensorData.type} sensorId=${sensorData.sensorId}`)
      delete sensorMap[sensorId]
      let emptySensorData = {
        type: sensorData.type,
        sensorId: sensorData.sensorId
      }
      sensorListener.sendToAll(JSON.stringify(emptySensorData))
    }
  }
}, sensorDataCheckMS);

MakeCRUDRoutes('sensor', router, sensorDao)

/*
POST /v1/sensor/push-data?id=temp-sensor
{"type":"temp/humi","temp":25.6,"humi":38.44,"t":300}

PM sensor:
{"type":"PM","pm1.0":2.52,"pm2.5":3.26,"pm4.0":3.74,"pm10.0":3.84,"nc0.5":16.08,"nc1.0":19.39,"nc2.5":20.09,"nc4.5":20.24,"nc10.0":20.26,"t":165}
*/
router.post('/push-data', async (req: Request, res: Response) => {
  let id = req.query.id
  let sensorData = req.body
  let sensor = await sensorDao.findOne('address', id as string)
  let proxyRemoteIp = req.headers['x-forwarded-for']
  let remoteIp = proxyRemoteIp || req.socket.remoteAddress?.split(':').pop() // '::ffff:192.168.5.26'.split(':').pop()
  if (!sensor) {
    debug(`sensor id not found in sensor table: id=${id} `)
    return res.status(OK).json();
  }

  debug(JSON.stringify(sensorData), (new Date()).toString())
  let data : Object | null = null
  if (sensorData.type == 'PM') {
    await knex('environment').insert({
      time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      value1: sensorData['pm2.5'],
      value2: sensorData['pm10.0'],
      sensorId: sensor.id
    });
    data = {
      time: new Date(),
      type: sensorData.type,
      sensorId: sensor.id,
      value1: sensorData['pm2.5'],
      value2: sensorData['pm10.0']
    }
    sensorListener.sendToAll(JSON.stringify(data))
  }
  else if (sensorData.type == 'temp/humi') {
    await knex('environment').insert({
      time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      value1: sensorData['temp'],
      value2: sensorData['humi'],
      sensorId: sensor.id
    });
    data = {
      time: new Date(),
      type: sensorData.type,
      sensorId: sensor.id,
      value1: sensorData['temp'],
      value2: sensorData['humi'],
    }
    sensorListener.sendToAll(JSON.stringify(data))
  }

  if (data) {
    if (!sensorMap.hasOwnProperty(sensor.id)) {
      failure.info(`환경 센서 통신 복구: ID(${sensor.id}) 타입(${sensorData.type}) IP(${remoteIp})`, '환경센서')
    }

    sensorMap[sensor.id] = data
  }

  return res.status(OK).json({});
})

router.get('/on-data', async (req: Request, res: Response) => {
  // 데이타
  //let sensors = req.query.sensors
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  }
  res.writeHead(OK, headers)

  //let user = req.tokenData.user
  let userId = 'test'
  let clientType = 'iot-sensor'
  sensorListener.addListener(userId, clientType, req, res)

  // 센서 데이터 변경된것을 Listening 하고 있는 부라우저에게 전달
  for (const sensorId in sensorMap) {
    sensorListener.sendToAll(JSON.stringify(sensorMap[sensorId]))
  }
})

export default router
