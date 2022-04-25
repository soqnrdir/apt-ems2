import Meter from '@entities/Meter'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:meters")
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class MeterDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<Meter | null> {
    return this.findOne('id', id)
  }

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<Meter | null> {
    let meters = await knex.select().from('meters').where(columnName, columnValue)
    return meters.length > 0 ? meters[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<Meter[] | null> {
    return await knex.select().from('meters').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<Meter[]> {
    let meters = await knex.select().from('meters').orderBy('regNo')
    return meters as any
  }


  /**
   *
   * @param meters
   */
  public async add(meters: ICRUDRecord): Promise<void> {
    let record = meters as Meter
    await knex('meters').insert(record)
    return {} as any
  }


  /**
   *
   * @param meters
   */
  public async update(meters: ICRUDRecord): Promise<void> {
    await knex('meters').where('id', meters.id).update(meters)
    return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('meters').where('id', id).delete()
    return {} as any
  }
}

export default MeterDao
