import { ICRUDRecord } from '@daos/CRUDDao'

class System implements ICRUDRecord {
  public id: string
  public location: string
  public manager: string
  public contractPower: number
  public checkDate: string
  public drAddress: string
  public substationcapacity: number


  constructor(system: null | System) {
    if (system === null) {
      this.id = ''
      this.location = ''
      this.manager = ''
      this.contractPower = 0
      this.checkDate = ''
      this.drAddress = ''
      this.substationcapacity = 0
    } else {
      this.id = system.id
      this.location = system.location
      this.manager = system.manager
      this.contractPower = system.contractPower
      this.checkDate = system.checkDate
      this.drAddress = system.drAddress
      this.substationcapacity = system.substationcapacity
    }
  }
}

export default System
