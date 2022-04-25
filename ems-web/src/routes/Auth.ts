import { Request, Response, Router } from 'express'
import { OK, UNAUTHORIZED, BAD_REQUEST } from 'http-status-codes'
import { authenticate, RequestWithAuth } from '../Middleware'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import UserDao from '@daos/UserDao'
import AdminDao from '@daos/AdminDao'
import User from '@entities/User'
import Admin from '@entities/Admin'
import {API} from '../Config'
import Debug from "debug"
const debug = Debug("ems:user")
import logger from '@shared/Logger'

const router = Router()
const userDao = new UserDao()
const adminDao = new AdminDao()

function extractNumbers(str: string) {
  let str2 = str.match(/\d+/g)?.join('')
  return Number(str2)
}

function getPurePhoneNo(no: string) {
  if (no.startsWith('+82')) // 국제 번호 형식의 전화번호 처리
      return extractNumbers(no.substring(3))
  return extractNumbers(no)
}

// androd 9 이상에서 얻은 전화 번호 형식은 +821012345678임으로
// 전화번호를 순수한 숫자로 만들어 비교함
function comparePhoneNo(p1: string, p2: string) {
  let n1 = getPurePhoneNo(p1)
  let n2 = getPurePhoneNo(p2)
  return !isNaN(n1) && n1 === n2
}

function makeToken(tokenData) {
  debug(`login tokenData=${JSON.stringify(tokenData)} authSecret=${API.authSecret}`)
  return jwt.sign(tokenData, API.authSecret, {expiresIn: API.expiresIn})
}

router.get('/user-current', authenticate, async (req: RequestWithAuth, res: Response) => {
  if (req.bearer) {
    if (!req.bearer.isAdmin) {
      let user : User = await userDao.getOne(req.bearer.id) as User
      delete user.password
      return res.status(OK).json(user)
    } else {
      return res.status(UNAUTHORIZED).json({ result: 'no current user found' })
    }
  } else {
    return res.status(UNAUTHORIZED).json({ result: 'no valid token found' })
  }
})

// Test command:
// curl -S -v -X POST -H "Content-Type: application/json" -d '{"userId":"test1","password":"","signature":"01012345678"}' http://localhost:8000/v1/auth/user-login
//
router.post('/user-login', async (req: Request, res: Response) => {
  const { userId, password, signature } = req.body
  debug(`login userId=${userId} password=${password} signature=${signature}`)
  if (!userId) {
    return res.status(BAD_REQUEST).json({ result: '입력 정보 부족(U1)' })
  }
  if (!signature) {
    return res.status(BAD_REQUEST).json({ result: '입력 정보 부족(S1)' })
  }
  try {
    const user = await userDao.login(userId, password)
    if (user) {
      if (user.phone) {
        if (!comparePhoneNo(user.phone, signature)) {
          logger.error(`${userId} phone not match: phone='${user.phone}' signature='${signature}'`)
          return res.status(BAD_REQUEST).json({ result: '전화번호 불일치' })
        }
      } else {
        logger.info(`${userId} not set phone number`)
      }
      user.lastLogin = new Date()
      logger.info(`${userId} login ok: signature='${signature} at ${user.lastLogin}'`)
      userDao.update(user)  // update되는것을 기다릴 필요는 없음으로 await는 사용하지 않음
      let tokenData = {isAdmin: false, id: user.id, textId: user.userId, loginAt: new Date()}
      return res.status(OK).json({ result: user, token: makeToken(tokenData) })
    } else {
      return res.status(BAD_REQUEST).json({ result: '사용자 인증 실패' })
    }
  }
  catch (err) {
    debug('exception:', err)
    return res.status(BAD_REQUEST).json({ result: err.message })
  }
})

router.post('/user-password', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { password } = req.body
  if (req.bearer && !req.bearer.isAdmin) {
    debug(`password id=${req.bearer.id} password=${password}`)
    try {
      let result = await userDao.password(req.bearer.id, password)
      return res.status(OK).json({ result: result })
    }
    catch (err) {
      debug('exception:', err)
      return res.status(BAD_REQUEST).json({ result: err.message })
    }
  } else {
    return res.status(UNAUTHORIZED).json({ result: 'unauthorized access' })
  }
})

router.get('/admin-current', authenticate, async (req: RequestWithAuth, res: Response) => {
  if (req.bearer) {
    if (req.bearer.isAdmin) {
      let admin : Admin = await adminDao.getOne(req.bearer.id) as Admin
      //debug(`login adminId=${admin.adminId} loginAt=${moment(req.bearer.loginAt).format('YYMMDD_HHmmss')}`)
      delete admin.password
      return res.status(OK).json(admin)
    } else {
      debug('no current admin found')
      return res.status(UNAUTHORIZED).json({ result: 'no current admin found' })
    }
  } else {
    return res.status(UNAUTHORIZED).json({ result: 'no valid token found' })
  }
})

router.post('/admin-login', async (req: Request, res: Response) => {
  const { adminId, password } = req.body
  debug(`login adminId=${adminId} password=${password}`)
  try {
    const admin = await adminDao.login(adminId, password) as Admin
    if (admin) {
      let tokenData = {isAdmin: true, id: admin.id, textId: admin.adminId, loginAt: new Date()}
      admin.lastLogin = new Date()
      await adminDao.update(admin)
      return res.status(OK).json({ result: admin, token: makeToken(tokenData) })
    } else {
      return res.status(BAD_REQUEST).json({ result: '사용자 인증 실패' })
    }
  }
  catch (err) {
    debug('exception:', err)
    return res.status(BAD_REQUEST).json({ result: err.message })
  }
})

router.post('/admin-password', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { password } = req.body
  if (req.bearer && req.bearer.isAdmin) {
    debug(`password id=${req.bearer.id} password=${password}`)
    try {
      let result = await adminDao.password(req.bearer.id, password)
      return res.status(OK).json({ result: result })
    }
    catch (err) {
      debug('exception:', err)
      return res.status(BAD_REQUEST).json({ result: err.message })
    }
  } else {
    return res.status(UNAUTHORIZED).json({ result: 'unauthorized access' })
  }
})

export default router
