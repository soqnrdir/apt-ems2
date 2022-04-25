import { ICRUDRecord } from '@daos/CRUDDao'

class Drdatas implements ICRUDRecord {
  public id: string
  public time: Date | null
  public starttime: Date | null
  public endtime: Date | null
  public reductionRate: number
  public note: string

  constructor(drdatas: null | Drdatas) {
    if (drdatas === null) {
      this.id = ''
      this.time = null
      this.starttime = null
      this.endtime = null
      this.reductionRate = 0
      this.note = ''
    } else {
      this.id = drdatas.id
      this.time = drdatas.time
      this.starttime = drdatas.starttime
      this.endtime = drdatas.endtime
      this.reductionRate = drdatas.reductionRate
      this.note = drdatas.note
    }
  }
}

export default Drdatas
