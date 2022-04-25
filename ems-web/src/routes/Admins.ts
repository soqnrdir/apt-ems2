import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { authenticate, RequestWithAuth } from '../Middleware'
import { ParamsDictionary } from 'express-serve-static-core'
import AdminDao from '@daos/AdminDao'
import { MakeCRUDRoutes } from './RouteUtil'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ems:routes")

// Init shared
const router = Router()
const adminDao = new AdminDao()

MakeCRUDRoutes('admins', router, adminDao)

router.get('/user', authenticate, async (req: RequestWithAuth, res: Response) => {
    const adminId = req.query['adminId'] as string | null
    try {
      let records = await knex.select()
                                  .from('admins')
                                  .where('adminId', adminId)                  
      return res.status(OK).json({ records: records })
    } catch (ex) {
      debug(`[usage] exception: ${ex}`)
      return res.status(BAD_REQUEST).json({ result: ex.message })
    }
  })

export default router
