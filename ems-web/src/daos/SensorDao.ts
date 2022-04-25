import Sensor from '@entities/Sensor'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:sensor")
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class SensorDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<Sensor | null> {
    return this.findOne('id', id)
  }

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<Sensor | null> {
    let sensor = await knex.select().from('sensor').where(columnName, columnValue)
    return sensor.length > 0 ? sensor[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<Sensor[] | null> {
    return await knex.select().from('sensor').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<Sensor[]> {
    let sensor = await knex.select().from('sensor').orderBy('id')
    return sensor as any
  }


  /**
   *
   * @param sensor
   */
  public async add(sensor: ICRUDRecord): Promise<void> {
    let record = sensor as Sensor
    await knex('sensor').insert(record)
    return {} as any
  }


  /**
   *
   * @param sensor
   */
  public async update(sensor: ICRUDRecord): Promise<void> {
    await knex('sensor').where('id', sensor.id).update(sensor)
    return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('sensor').where('id', id).delete()
    return {} as any
  }
}

export default SensorDao
