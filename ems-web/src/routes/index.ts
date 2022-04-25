import { Router } from 'express'
import AuthRouter from './Auth'
import UserRouter from './Users'
import AdminRouter from './Admins'
import SystemRouter from './System'
import FacilityRouter from './Facilities'
import MeasurementRouter from './Measurement'
import MeterRouter from './Meter'
import SensorRouter from './Sensor'
import UsageRouter from './Usage'
import MonthUsageRouter from './MonthUsage'
import EnvironmentRouter from './Environment'
import EquipFailureRouter from './EquipFailure'
import DrdatasRouter from './Drdatas'
import TestRouter from './Test'
import EgaugeRouter from './Egauge'
import NotiRouter from './Noti'
//import DrdatasRouter from './Drdatas'

// Init router and path
const router = Router()

// Add sub-routes
router.use('/auth', AuthRouter)
router.use('/users', UserRouter)
router.use('/admins', AdminRouter)
router.use('/system', SystemRouter)
router.use('/facilities', FacilityRouter)
router.use('/measurement', MeasurementRouter)
router.use('/meters', MeterRouter)
router.use('/sensor', SensorRouter)
router.use('/usage', UsageRouter)
router.use('/monthUsage', MonthUsageRouter)
router.use('/environment', EnvironmentRouter)
router.use('/equipfailure', EquipFailureRouter)
router.use('/drdatas', DrdatasRouter)
router.use('/tests', TestRouter)
router.use('/egauges', EgaugeRouter)
router.use('/noti', NotiRouter)
//router.use('/drdatas', DrdatasRouter)

// Export the base-router
export default router
