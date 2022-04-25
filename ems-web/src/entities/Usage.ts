
class Usage {
  public time: Date | null
  public energy: number
  public meterId: string

  constructor(usage: null | Usage) {
    if (usage === null) {
      this.time = null
      this.energy = 0
      this.meterId = ''
    } else {
      this.time = usage.time
      this.energy = usage.energy
      this.meterId = usage.meterId
    }
  }
}

export default Usage
