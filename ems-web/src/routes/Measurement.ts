import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { RequestWithAuth } from '../Middleware'
import { MakeCRUDRoutes } from './RouteUtil'

import MeasurementDao from '@daos/MeasurementDao'
import { paramMissingError } from '@shared/constants'
import Debug from 'debug'
const debug = Debug("ems:measurement")
import logger from '@shared/Logger'

const router = Router()
const measurementDao = new MeasurementDao()

MakeCRUDRoutes('measurement', router, measurementDao)

export default router
