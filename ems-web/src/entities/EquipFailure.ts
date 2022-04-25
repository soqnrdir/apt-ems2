import { ICRUDRecord } from '@daos/CRUDDao'

export const Failure_Error = '오류'
export const Failure_Warning = '경고'
export const Failure_Info = '정보'

export class EquipFailure implements ICRUDRecord{
  public id?: string
  public time: Date | null
  public type: string
  public content: string
  public target: string

  constructor(equipfailure: null | EquipFailure) {
    if (equipfailure === null) {
      this.time = new Date()
      this.type = ''
      this.content = ''
      this.target = ''
    } else {
      this.id = equipfailure.id
      this.time = equipfailure.time
      this.type = equipfailure.type
      this.content = equipfailure.content
      this.target = equipfailure.target
    }
  }
}

export default EquipFailure
