import Debug from "debug"
const debug = Debug("ems:EMS")
import { PushListener } from '@EMS/PushListener'
import { Request, Response } from 'express'

class NotiData {
  public type: string
  public data: string

  constructor(type: string, data: string) {
    this.type = type
    this.data = data
  }
}

class ChangeNotifier {
  private dataListener = new PushListener()

  constructor() {
  }

  //
  // 변경된 에너지 데이터를 모든 클라이언트들에게 보냄
  notifyDataChang(data: string): void {
    this.dataListener.sendToAll(JSON.stringify(new NotiData('data-change', data)))
  }

  addListener(userId: string, clientType: string, request: Request, response: Response) {
    this.dataListener.addListener(userId, clientType, request, response)
  }

}

export var changeNotifier = new ChangeNotifier()

export default changeNotifier
