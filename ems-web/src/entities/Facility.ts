import { ICRUDRecord } from '@daos/CRUDDao'

class Facility implements ICRUDRecord {
  public id: string
  public regNo: string
  public name: string
  public location: string
  public regDate: string
  public note: string
  public type: string
  public capacity: number

  constructor(facility: null | Facility) {
    if (facility === null) {
      this.id = ''
      this.regNo = ''
      this.name = ''
      this.location = ''
      this.regDate = ''
      this.note = ''
      this.type = ''
      this.capacity = 0
    } else {
      this.id = facility.id
      this.regNo = facility.regNo
      this.name = facility.name
      this.location = facility.location
      this.regDate = facility.regDate
      this.note = facility.note
      this.type = facility.type
      this.capacity = facility.capacity  
    }
  }
}

export default Facility
