import {Request, Response, NextFunction} from 'express'
import Debug from "debug"
import momen from 'moment'
const debug = Debug("ems:auth")
import jwt from 'jsonwebtoken'
import {API} from './Config'
import { BAD_REQUEST, UNAUTHORIZED, OK } from 'http-status-codes'
import Admin from '@entities/Admin'
import AdminDao from '@daos/AdminDao'

// tslint:disable-next-line no-any
export type PromiseMiddleware = (req: Request, res: Response) => Promise<any>

/**
 * 로그인 인증후 생성된 토큰을 클라이언트가 HTTP 헤더로 전달해오는 사용자 정보를 유지하기
 * 위한 클래스이다.
 */
export class Bearer {
  private _isAdmin: boolean // admin 인지 user인지 구분
  public get isAdmin(): boolean {
    return this._isAdmin
  }

  private _id: string          // DB 레코드 키 entity의 id
  public get id(): string {
    return this._id
  }

  private _textId: string            // 사용자 ID
  public get textId(): string {
    return this._textId
  }

  private _loginAt: Date

  public get loginAt(): Date {
    return this._loginAt
  }

  constructor(isAdmin: boolean, id: string, textId: string, loginAt: Date) {
    this._isAdmin = isAdmin
    this._id = id
    this._textId = textId
    this._loginAt = loginAt
  }
}

export const promise = (middleware: PromiseMiddleware) => (
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await middleware(req, res)

      if (result) {
        res.json(result)
      } else {
        next()
      }
    } catch (err) {
      next(err)
    }
  }
)

export interface RequestWithAuth extends Request {
  bearer ?: Bearer
}

export const authenticate = async (req: RequestWithAuth, res: Response, next: NextFunction) => {
  let token = <string>(req.headers['x-access-token'] || req.headers['authorization']) // Express headers are auto converted to lowercase

  //debug(`token=${token}`)
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, API.authSecret, (err, decoded) => {
      if (err) {
        debug('verify error:', err.message)
        res.status(UNAUTHORIZED).json({
          result:'인증 실패(invalid token)'
        })
      } else {
        //debug('decoded jwt:', decoded)
        req.bearer = new Bearer(decoded.isAdmin, decoded.id, decoded.textId, new Date(decoded.loginAt))
        next()
      }
    })
  } else if (API.authDisabled) {
    debug('authDisabled - API supplied in public')
    let adminDao = new AdminDao
    let admin : Admin = await adminDao.findOne('adminId', 'tester') as Admin
    if (admin) {
      req.bearer = new Bearer(true, admin.id, admin.adminId, new Date())
    } else {
      console.log("authenticate: test admin account 'tester' not found in admins")
    }
    next()
  } else {
    debug('Auth token is not supplied')
    res.status(UNAUTHORIZED).json({
      result:'access forbidden'
    })
  }
}

export default {promise, authenticate}
