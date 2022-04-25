
class Environment {
  public time: Date | null
  public value1: number
  public value2: number
  public sensorId: number

  constructor(environment: null | Environment) {
    if (environment === null) {
      this.time = null
      this.value1 = 0
      this.value2 = 0
      this.sensorId = 0
    } else {
      this.time = environment.time
      this.value1 = environment.value1
      this.value2 = environment.value2
      this.sensorId = environment.sensorId
    }
  }
}

export default Environment
