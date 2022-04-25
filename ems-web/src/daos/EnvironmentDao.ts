import Environment from '@entities/Environment'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:environment")
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class EnvironmentDao {

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<Environment | null> {
    let environment = await knex.select().from('environment').where(columnName, columnValue)
    return environment.length > 0 ? environment[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<Environment[] | null> {
    return await knex.select().from('environment').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<Environment[]> {
    let environment = await knex.select().from('environment')
    return environment as any
  }


  /**
   *
   * @param environment
   */
  public async add(environment: Environment): Promise<void> {
    debug('environment', environment)
    await knex('environment').insert(environment)
    return {} as any
  }


  /**
   *
   * @param environment
   */
  public async update(environment: Environment): Promise<void> {
    await knex('environment').where({'time': environment.time, 'sensorId': environment.sensorId}).update(environment)
    return {} as any
  }

}

export default EnvironmentDao
