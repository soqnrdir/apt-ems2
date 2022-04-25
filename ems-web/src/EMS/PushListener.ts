import Debug from "debug"
const debug = Debug("ffhcs:push")
import { Request, Response } from 'express'

class PushClient {
  public userId: string
  public clientId: string
  public response: Response

  constructor(userId: string, clientId: string, response: Response) {
    this.userId = userId
    this.clientId = clientId
    this.response = response
  }
}

export class PushListener {
  private listeners : Array<PushClient> = []
  private numOfAccess = 0

  constructor() {
  }

  addListener(userId: string, clientType: string, request: Request, response: Response) {
    let clientId = `${clientType}#${userId}-${++this.numOfAccess}`
    let client = new PushClient(userId, clientId, response)
    debug(`push client added: clientId=${clientId} clientType=${clientType} N-clients=${this.listeners.length}`);
    this.listeners.push(client)
    request.on('close', () => {
      debug(`push client disconnected: clientId=${clientId}`);
      this.listeners = this.listeners.filter(client => client.clientId !== clientId)
    });
  }

  sendToAll(text: string) {
    debug(`push text: clients=${this.listeners.length}`);
    this.listeners.forEach(client => this.sendTo(text, client.response))
  }

  sendTo(text: string, response: Response) {
    // Push 데이터 끝 구분은 '\n\n'
    response.write(`data: ${text}\n\n`)
  }

}
