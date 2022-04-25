import { ICRUDRecord } from '@daos/CRUDDao'

class Meter implements ICRUDRecord {
  public id: string
  public regNo: string
  public facilityId: string
  public measurementId: string
  public address: string
  public note: string
  public metername : string
  public type : string

  constructor(meters: null | Meter) {
    if (meters === null) {
      this.id = ''
      this.regNo = ''
      this.facilityId = ''
      this.measurementId = ''
      this.address = ''
      this.note = ''
      this.metername = ''
      this.type = ''
    } else {
      this.id = meters.id
      this.regNo = meters.regNo
      this.facilityId = meters.facilityId
      this.measurementId = meters.measurementId
      this.address = meters.address
      this.note = meters.note
      this.metername = meters.metername
      this.type = meters.type
    }
  }
}

export default Meter
