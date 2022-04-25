import MonthUsage from '@entities/MonthUsage'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:monthusage")
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class MonthUsageDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<MonthUsage | null> {
    return this.findOne('id', id)
  }

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<MonthUsage | null> {
    let monthUsage = await knex.select().from('monthusage').where(columnName, columnValue)
    return monthUsage.length > 0 ? monthUsage[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<MonthUsage[] | null> {
    return await knex.select().from('monthusage').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<MonthUsage[]> {
    let monthUsage = await knex.select().from('monthusage').orderBy('date')
    return monthUsage as any
  }


  /**
   *
   * @param monthUsage
   */
  public async add(monthUsage: ICRUDRecord): Promise<void> {
    let record = monthUsage as MonthUsage
    await knex('monthusage').insert(record)
    return {} as any
  }


  /**
   *
   * @param monthUsage
   */
  public async update(monthUsage: ICRUDRecord): Promise<void> {
    await knex('monthusage').where('id', monthUsage.id).update(monthUsage)
    return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('monthusage').where('id', id).delete()
    return {} as any
  }
}

export default MonthUsageDao
