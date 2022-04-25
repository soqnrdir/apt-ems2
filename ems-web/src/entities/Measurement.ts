import { ICRUDRecord } from '@daos/CRUDDao'

class Measurement implements ICRUDRecord {
  public id: string
  public regNo: string
  public measureName: string
  public contype: string
  public address: string
  public regDate: string
  public modelName: string
  public note: string

  constructor(measurement: null | Measurement) {
    if (measurement === null) {
      this.id = ''
      this.regNo = ''
      this.measureName = ''
      this.contype = ''
      this.address = ''
      this.regDate = ''
      this.modelName = ''
      this.note = ''
    } else {
      this.id = measurement.id
      this.regNo = measurement.regNo
      this.measureName = measurement.measureName
      this.contype = measurement.contype
      this.address = measurement.address
      this.regDate = measurement.regDate
      this.modelName = measurement.modelName
      this.note = measurement.note
    }
  }
}

export default Measurement
