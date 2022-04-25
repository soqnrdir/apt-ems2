import Measurement from '@entities/Measurement'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:measurement")
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class MeasurementDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<Measurement | null> {
    return this.findOne('id', id)
  }

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<Measurement | null> {
    let measurement = await knex.select().from('measurement').where(columnName, columnValue)
    return measurement.length > 0 ? measurement[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<Measurement[] | null> {
    return await knex.select().from('measurement').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<Measurement[]> {
    let measurement = await knex.select().from('measurement').orderBy('regNo')
    return measurement as any
  }


  /**
   *
   * @param measurement
   */
  public async add(measurement: ICRUDRecord): Promise<void> {
    let record = measurement as Measurement
    await knex('measurement').insert(record)
    return {} as any
  }


  /**
   *
   * @param measurement
   */
  public async update(measurement: ICRUDRecord): Promise<void> {
    await knex('measurement').where('id', measurement.id).update(measurement)
    return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('measurement').where('id', id).delete()
    return {} as any
  }
}

export default MeasurementDao
