import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { RequestWithAuth } from '../Middleware'
import { MakeCRUDRoutes } from './RouteUtil'

import SystemDao from '@daos/SystemDao'
import { paramMissingError } from '@shared/constants'
import Debug from 'debug'
const debug = Debug("ems:system")
import logger from '@shared/Logger'

const router = Router()
const systemDao = new SystemDao()

MakeCRUDRoutes('system', router, systemDao)

export default router
