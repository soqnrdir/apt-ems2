import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { authenticate, RequestWithAuth } from '../Middleware'
import EnvironmentDao from '@daos/EnvironmentDao'
import Debug from 'debug'
const debug = Debug("ems:finedust")
import logger from '@shared/Logger'
import { knex } from '@daos/Instance'

const router = Router()
const environmentDao = new EnvironmentDao()

router.get('/all', authenticate, async (req: RequestWithAuth, res: Response) => {
  try {
    const records = await environmentDao.getAll()
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[usage] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/search-list', authenticate, async (req: RequestWithAuth, res: Response) => {
  const sensorId = req.query['sensorId'] as string | null
  const startDt = req.query['startDt'] as string | null
  const endDt = req.query['endDt'] as string | null
  try {
    let records = await knex.select()
                                .from('environment')
                                .whereBetween('time', [startDt, endDt])
                                .where('sensorId' , sensorId)
                                .orderBy('time', 'desc')       
                                .limit(10000)                
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[usage] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

export default router