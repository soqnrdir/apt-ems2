import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { authenticate,RequestWithAuth  } from '../Middleware'
import { MakeCRUDRoutes } from './RouteUtil'

import DrdatasDao from '@daos/DrdatasDao'
import { paramMissingError } from '@shared/constants'
import Debug from 'debug'
const debug = Debug("ems:drdatas")
import logger from '@shared/Logger'
import { knex } from '@daos/Instance'

const router = Router()
const drdatasDao = new DrdatasDao()

MakeCRUDRoutes('drdatas', router, drdatasDao)

router.get('/search-list', authenticate, async (req: RequestWithAuth, res: Response) => {
    const startDt = req.query['startDt'] as string | null
    const endDt = req.query['endDt'] as string | null
    try {
      let records = await knex.select()
                                  .from('drdatas')
                                  .whereBetween('time', [startDt, endDt])
                                  .orderBy('time' , 'desc')                     
      return res.status(OK).json({ records: records })
    } catch (ex) {
      debug(`[usage] exception: ${ex}`)
      return res.status(BAD_REQUEST).json({ result: ex.message })
    }
  })

export default router
