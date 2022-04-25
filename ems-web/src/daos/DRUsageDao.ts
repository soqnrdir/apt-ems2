import DRUsage from '@entities/DRUsage'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:drusage")

class DRUsageDao {

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<DRUsage | null> {
    let drusage = await knex.select().from('drusage').where(columnName, columnValue)
    return drusage.length > 0 ? drusage[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<DRUsage[] | null> {
    return await knex.select().from('drusage').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<DRUsage[]> {
    let drusage = await knex.select().from('drusage').limit(1000)
    return drusage as any
  }


  /**
   *
   * @param drusage
   */
  public async add(drusage: DRUsage): Promise<void> {
    await knex('drusage').insert(drusage)
    return {} as any
  }

}

export default DRUsageDao
