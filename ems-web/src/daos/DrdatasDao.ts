import Drdatas from '@entities/Drdatas'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:drdatas")
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class DrdatasDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<Drdatas | null> {
    return this.findOne('id', id)
  }

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<Drdatas | null> {
    let drdatas = await knex.select().from('drdatas').where(columnName, columnValue)
    return drdatas.length > 0 ? drdatas[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<Drdatas[] | null> {
    return await knex.select().from('drdatas').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<Drdatas[]> {
    let drdatas = await knex.select().from('drdatas').orderBy('time', 'desc')
    return drdatas as any
  }


  /**
   *
   * @param drdatas
   */
  public async add(drdatas: ICRUDRecord): Promise<void> {
    let record = drdatas as Drdatas
    await knex('drdatas').insert(record)
    return {} as any
  }


  /**
   *
   * @param drdatas
   */
  public async update(drdatas: ICRUDRecord): Promise<void> {
    await knex('drdatas').update(drdatas)
    return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('drdatas').where('id', id).delete()
    return {} as any
  }
}

export default DrdatasDao
