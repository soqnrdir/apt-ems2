import System from '@entities/System'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:system")
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class SystemDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<System | null> {
    return this.findOne('id', id)
  }

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<System | null> {
    let system = await knex.select().from('system').where(columnName, columnValue)
    return system.length > 0 ? system[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<System[] | null> {
    return await knex.select().from('system').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<System[]> {
    let system = await knex.select().from('system')
    return system as any
  }


  /**
   *
   * @param system
   */
  public async add(system: ICRUDRecord): Promise<void> {
    let record = system as System
    await knex('system').insert(record)
    return {} as any
  }


  /**
   *
   * @param system
   */
  public async update(system: ICRUDRecord): Promise<void> {
    await knex('system').update(system)
    return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('system').where('id', id).delete()
    return {} as any
  }
}

export default SystemDao
