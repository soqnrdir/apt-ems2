import {EquipFailure, Failure_Error, Failure_Warning, Failure_Info} from '@entities/EquipFailure'
import Debug from "debug"
const debug = Debug("ems:failure")
import EquipFailureDao from '@daos/EquipFailureDao'
import changeNotifier from "./ChangeNotifier"

const equipfailureDao = new EquipFailureDao()

const ERROR_SUPRESS_SECONDS = 3600  // ERROR_SUPRESS_SECONDS 시간동안 동일 에러메시지 처리되지 않게함

// 연속된 동일 오류가 저장되는것을 막기 위한 클래스
class Suppressor {
  public map : Map<string, number> = new Map<string, number>()

  constructor() {
  }

  public canBeIgnored(tag: string) {
    let prevUptime = this.map.get(tag)
    if (prevUptime) {
      if (process.uptime() - prevUptime < ERROR_SUPRESS_SECONDS)
        return true
    }
    return false
  }

  public registerTag(tag: string) {
    this.map.set(tag, process.uptime())
  }

  public unregisterTag(tag: string) {
    this.map.delete(tag)
  }
}

class Failure {
  private errorSupresser = new Suppressor()

  constructor() {
  }

  // 해당 태그에 해당하는 메시지 중복 체크 해제
  public removeDupTag(dupTag: string) {
    this.errorSupresser.unregisterTag(dupTag)
  }

  public async addFailure(type: string, content: string, target: string): Promise<void> {
    let record = new EquipFailure(null)
    record.time = new Date()
    record.type = type
    record.content = content
    record.target = target
    debug(`Failure: type=${type} type=${content} type=${target}`)
    changeNotifier.notifyDataChang('equipfailure')
    await equipfailureDao.add(record)
  }

  public async error(content: string, target: string, dupTag: string = ''): Promise<void> {
    if (dupTag) {
      if (this.errorSupresser.canBeIgnored(dupTag)) {
        debug(`error ignored : ${content}`)
        return
      }
      this.errorSupresser.registerTag(dupTag)
    }
    await this.addFailure(Failure_Error, content, target)
  }

  public async warning(content: string, target: string, dupTag: string = ''): Promise<void> {
    if (dupTag) {
      if (this.errorSupresser.canBeIgnored(dupTag)) {
        debug(`warning ignored : ${content}`)
        return
      }
      this.errorSupresser.registerTag(dupTag)
    }
    await this.addFailure(Failure_Warning, content, target)
  }

  public async info(content: string, target: string, dupTag: string = ''): Promise<void> {
    if (dupTag) {
      if (this.errorSupresser.canBeIgnored(dupTag)) {
        debug(`info ignored : ${content}`)
        return
      }
      this.errorSupresser.registerTag(dupTag)
    }
    await this.addFailure(Failure_Info, content, target)
  }
}

const failure = new Failure()

export default failure
