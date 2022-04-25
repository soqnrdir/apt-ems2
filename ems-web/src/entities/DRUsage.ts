
class DRUsage {
  public dateTime: Date | null
  public customerNo: string
  public period: number
  public usage: number
  public peakDemand: number
  public meterId: string

  constructor(usage: null | DRUsage) {
    if (usage === null) {
      this.dateTime = null
      this.customerNo = ''
      this.period = 0
      this.usage = 0
      this.peakDemand = 0
      this.meterId = ''
    } else {
      this.dateTime = usage.dateTime
      this.customerNo = usage.customerNo
      this.period = usage.period
      this.usage = usage.usage
      this.peakDemand = usage.peakDemand
      this.meterId = usage.meterId
    }
  }
}

export default DRUsage
