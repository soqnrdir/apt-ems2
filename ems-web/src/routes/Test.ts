import { Request, Response, Router } from 'express'
import { OK, BAD_REQUEST } from 'http-status-codes';
import Debug from "debug"
const debug = Debug("ems:routes")
import logger from '@shared/Logger'
import emsChecker from '@EMS/index'
import {handlePushData, getEgaugeShow} from '@EMS/Egauge'
import moment from 'moment';

const router = Router()

router.get('/ems-test', async (req: Request, res: Response) => {
  try {
    let input = req.query.input || ''
    debug(`ems-test: input=${input}`)
    emsChecker.test(input as string)
    return res.status(OK).json({ result: 'ok' })
  } catch (err) {
    logger.error(`exception in 'ems-test' API: ${err.message}`)
    return res.status(BAD_REQUEST).json({ result: err.message })
  }
})

router.get('/handle-push-data', async (req: Request, res: Response) => {
  var xmlData = `
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
  `
  try {
    let deviceId = req.query.Id || ''
    handlePushData(deviceId as string, xmlData, false)
    return res.status(OK).json({ result: 'ok' })
  } catch (err) {
    logger.error(`exception in 'handle-push-data' API: ${err.message}`)
    return res.status(BAD_REQUEST).json({ result: err.message })
  }
})

/**
 * 특정 egauge로 부터 기간내 데이터를 받아서 DB에 업데이트함
 * curl -v -O "http://localhost:3012/v1/tests/egauge-show?addr=jaguar40589.jaguariotmeters.net"
 */
router.get('/egauge-show', async (req: Request, res: Response) => {
  try {
    let deviceId = req.query.Id || ''
    let addr = req.query.addr
    let f = req.query.f ? moment.unix(Number(req.query.f)).unix() : moment().unix()
    let t = req.query.t ? moment.unix(Number(req.query.f)).unix() : moment.unix(f).subtract(24, 'hours').unix()

    let url = `http://${addr}/cgi-bin/egauge-show?m&f=${f}&t=${t}`
    console.log(req.query.f, f, moment().unix(), `GET ${url} f=${moment.unix(f).format()} t=${moment.unix(t).format()}`)
    await getEgaugeShow(deviceId as string, url)
    return res.status(OK).json({ result: 'ok' })
  } catch (err) {
    logger.error(`exception in 'egage-show-test' API: ${err.message}`)
    return res.status(BAD_REQUEST).json({ result: err.message })
  }
})

/**
 * 특정 egauge로 부터 한달 분량 데이터를 받아서 DB에 업데이트함
 * curl -v -O "http://localhost:3012/v1/tests/egauge-month-data?date=2021-08-01&addr=jaguar40589.jaguariotmeters.net"
 */
router.get('/egauge-month-data', async (req: Request, res: Response) => {
  try {
    let deviceId = req.query.Id || ''
    let addr = req.query.addr
    let begin = moment(req.query.date as string).startOf('month')
    let end = moment(begin).endOf('month')
    let ndays = 0
    do {
      let f = moment(begin).endOf('day')
      let t = moment(begin).startOf('day')
      let url = `http://${addr}/cgi-bin/egauge-show?m&f=${f.unix()}&t=${t.unix()}`
      console.log(`GET ${url} f=${f.format()} t=${t.format()}`)
      await getEgaugeShow(deviceId as string, url)
      ndays++
    } while(begin.add(1, 'days').diff(end) < 0)

    return res.status(OK).json({ result: ndays })
  } catch (err) {
    logger.error(`exception in 'egage-show-test' API: ${err.message}`)
    return res.status(BAD_REQUEST).json({ result: err.message })
  }
})

export default router
