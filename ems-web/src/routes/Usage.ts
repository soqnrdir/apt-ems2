import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { authenticate, RequestWithAuth } from '../Middleware'
import UsageDao from '@daos/UsageDao'
import Debug from 'debug'
const debug = Debug("ems:usage")
import logger from '@shared/Logger'
import { knex } from '@daos/Instance'
import emsChecker from '../EMS'

const router = Router()
const usageDao = new UsageDao()

// "GET /v1/useages/all"
router.get('/all', authenticate, async (req: RequestWithAuth, res: Response) => {
  try {
    const records = await usageDao.getAll()
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[usage] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/search-list', authenticate, async (req: RequestWithAuth, res: Response) => {
  const meterId = req.query['meterId'] as string | null
  const startDt = req.query['startDt'] as string | null
  const endDt = req.query['endDt'] as string | null
  try {
    let records = await knex.select()
                                .from('usage')
                                .whereBetween('time', [startDt, endDt])
                                .where('meterId' , meterId)
                                .orderBy('time', 'desc')       
                                .limit(10000)                
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[usage] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/search-listPer', authenticate, async (req: RequestWithAuth, res: Response) => {
  const meterId = req.query['meterId'] as string | null
  const startDt = req.query['startDt'] as string | null
  const endDt = req.query['endDt'] as string | null
  try {
    let records = await knex.select(knex.raw("to_char(time, 'YYYY-MM-DD') as time")).count()
                                .from('usage')
                                .whereBetween('time', [startDt, endDt])
                                .where('meterId' , meterId)
                                .groupByRaw("to_char(time, 'YYYY-MM-DD')")
                                .orderBy('time', 'desc')
                                .limit(10000)                
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[usage] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/search-listPerTotal', authenticate, async (req: RequestWithAuth, res: Response) => {
  const startDt = req.query['startDt'] as string | null
  const endDt = req.query['endDt'] as string | null
  try {
    let records = await knex.select("meterId").count()
                                .from('usage')
                                .whereBetween('time', [startDt, endDt])
                                .groupBy("meterId")
                                .orderBy('meterId')
                                .limit(10000)                
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[usage] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/on-data', async (req: Request, res: Response) => {
  // 데이타
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  }
  res.writeHead(OK, headers)

  //let user = req.tokenData.user
  let userId = 'test'
  let clientType = 'iot-sensor'
  emsChecker.addListener(userId, clientType, req, res)
})

// router.get(
//   "/minuteList",
//   authenticate,
//   async (req: RequestWithAuth, res: Response) => {
//     let meterId = req.query['meterId'] as string | null
//     debug(`query=${JSON.stringify(req.query)}`)
//     try {
//         // let records = await knex.select().from('meters').join('facilities', 'meters.facilityId', '=', 'facilities.id')
//         let query = `
//         select  strftime('%Y%m%d%H', datetime(time/1000,'unixepoch', 'localtime')) as 'YmdH' , energy 
//         from usage
//         where 1 = 1
//         `
//         if (meterId != null) {
//           query += ` and meterId = ${meterId}
//                      order by time`
//         } else {
//           query += `order by time`
//         }
//         let records = await knex.raw(query)
//       return res.status(OK).json({ records: records });
//     } catch (ex) {
//       debug(`[usage] exception: ${ex}`);
//       return res.status(BAD_REQUEST).json({ result: ex.message });
//     }
//   }
// );

export default router
