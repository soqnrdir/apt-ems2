import Facility from '@entities/Facility'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:facilities")
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class FacilityDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<Facility | null> {
    return this.findOne('id', id)
  }

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<Facility | null> {
    let facilities = await knex.select().from('facilities').where(columnName, columnValue)
    return facilities.length > 0 ? facilities[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<Facility[] | null> {
    return await knex.select().from('facilities').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<Facility[]> {
    let facilities = await knex.select().from('facilities').orderBy('regNo')
    return facilities as any
  }


  /**
   *
   * @param facility
   */
  public async add(facility: ICRUDRecord): Promise<void> {
    let record = facility as Facility
    await knex('facilities').insert(record)
    return {} as any
  }


  /**
   *
   * @param facility
   */
  public async update(facility: ICRUDRecord): Promise<void> {
    await knex('facilities').where('id', facility.id).update(facility)
    return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('facilities').where('id', id).delete()
    return {} as any
  }
}

export default FacilityDao
