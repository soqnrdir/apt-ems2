import { ICRUDRecord } from '@daos/CRUDDao'

class Sensor implements ICRUDRecord {
  public id: string
  public sensorType: string
  public sensorName: string
  public location: string
  public regDate: string
  public address: string
  public note: string

  constructor(sensor: null | Sensor) {
    if (sensor === null) {
      this.id = ''
      this.sensorType = ''
      this.sensorName = ''
      this.location = ''
      this.regDate = ''
      this.address = ''
      this.note = ''
    } else {
      this.id = sensor.id
      this.sensorType = sensor.sensorType
      this.sensorName = sensor.sensorName
      this.location = sensor.location
      this.regDate = sensor.regDate
      this.address = sensor.address
      this.note = sensor.note
    }
  }
}

export default Sensor
