import { Request, Response, Router } from 'express'
import Debug from "debug"
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import changeNotifier from '@EMS/ChangeNotifier'

const debug = Debug("ems:routes")
const router = Router()

router.get('/on-data-change', async (req: Request, res: Response) => {
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
  changeNotifier.addListener(userId, clientType, req, res)
})

export default router
