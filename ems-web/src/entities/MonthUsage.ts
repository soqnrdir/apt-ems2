import { ICRUDRecord } from '@daos/CRUDDao'

class MonthUsage implements ICRUDRecord {
  public id: string
  public date: string
  public residentialUsage: number
  public residentialRates: number
  public IndustrialUsage: number
  public IndustrialRates: number
  public streetLampUsage: number
  public streetLampRates: number


  constructor(monthUsage: null | MonthUsage) {
    if (monthUsage === null) {
      this.id = ''
      this.date = ''
      this.residentialUsage = 0
      this.residentialRates = 0
      this.IndustrialUsage = 0
      this.IndustrialRates = 0
      this.streetLampUsage = 0
      this.streetLampRates = 0

    } else {
      this.id = monthUsage.id
      this.date = monthUsage.date
      this.residentialUsage = monthUsage.residentialUsage
      this.residentialRates = monthUsage.residentialRates
      this.IndustrialUsage = monthUsage.IndustrialUsage
      this.IndustrialRates = monthUsage.IndustrialRates
      this.streetLampUsage = monthUsage.streetLampUsage
      this.streetLampRates = monthUsage.streetLampRates
    }
  }
}

export default MonthUsage
