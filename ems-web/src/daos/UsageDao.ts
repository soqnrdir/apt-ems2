import Usage from '@entities/Usage'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:usage")

class UsageDao {

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<Usage | null> {
    let usage = await knex.select().from('usage').where(columnName, columnValue)
    return usage.length > 0 ? usage[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<Usage[] | null> {
    return await knex.select().from('usage').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<Usage[]> {
    let usage = await knex.select().from('usage').limit(1000)
    return usage as any
  }


  /**
   *
   * @param usage
   */
  public async add(usage: Usage): Promise<void> {
    await knex('usage').insert(usage)
    return {} as any
  }


  /**
   *
   * @param usage
   */
  public async update(usage: Usage): Promise<void> {
    await knex('usage').where({'time': usage.time, 'meterId': usage.meterId}).update(usage)
    return {} as any
  }

}

export default UsageDao
