import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { authenticate, RequestWithAuth } from '../Middleware'
import { MakeCRUDRoutes } from './RouteUtil'

import FacilityDao from '@daos/FacilityDao'
import { paramMissingError } from '@shared/constants'
import Debug from 'debug'
const debug = Debug("ems:facilities")
import logger from '@shared/Logger'
import { knex } from '@daos/Instance'
import emsChecker from '../EMS'

const router = Router()
const facilityDao = new FacilityDao()

router.get('/all', authenticate, async (req: RequestWithAuth, res: Response) => {
  try {
    const records = await facilityDao.getAll()
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[facilities] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/get/:id', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { id } = req.params as ParamsDictionary
  const record = await facilityDao.getOne(id)
  if (record) {
    return res.status(OK).json(record)
  } else {
    debug(`[facilities] record not found: id=${id}`)
    return res.status(OK).json('')
  }
})

router.post('/add', authenticate, async (req: RequestWithAuth, res: Response) => {
  const record = req.body
  debug(`record: ${JSON.stringify(record)}`)
  if (!record) {
    debug('[facilities] request with empty body')
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    })
  }
  try {
    const result = await facilityDao.add(record)
    return res.status(CREATED).json({ result: result })
  } catch (ex) {
    debug(`exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.put('/update', authenticate, async (req: RequestWithAuth, res: Response) => {
  const record = req.body
  if (!record) {
    debug('[facilities] request with empty body')
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    })
  }
  try {
    const result = await facilityDao.update(record)
    // emsChecker내부에서 정보를 참조하고 있기 때문에 수정 사항을 반영시킨다.
    emsChecker.updatefacilityData(record.id, record.name, record.capacity)
    return res.status(OK).json({ result: result })
  } catch (ex) {
    debug(`[facilities] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/home-capacity', authenticate, async (req: RequestWithAuth, res: Response) => {
  try {
    let records = await knex.select()
      .from('facilities')
      .whereIn('type', ['메인', '변압기' , '공용변압기'])
      .orderBy('regNo')
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[facilities] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.delete('/delete/:id', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { id } = req.params as ParamsDictionary
  try {
    const result = await facilityDao.delete(id)
    return res.status(OK).json({ result: result })
  } catch (ex) {
    debug(`[facilities] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

export default router
