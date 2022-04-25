import {EquipFailure, Failure_Error, Failure_Warning, Failure_Info} from '@entities/EquipFailure'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:equipfailure")
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class EquipFailureDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<EquipFailure | null> {
    return this.findOne('id', id)
  }

  /**
   * @param id
   */
  public async findOne(columnName: string, columnValue: string): Promise<EquipFailure | null> {
    let equipfailure = await knex.select().from('equipfailure').where(columnName, columnValue)
    return equipfailure.length > 0 ? equipfailure[0] : null as any
  }

  /**
   * @param whereRaw
   */
  public async find(whereRaw: string): Promise<EquipFailure[] | null> {
    return await knex.select().from('equipfailure').whereRaw(whereRaw)
  }

  /**
   *
   */
  public async getAll(): Promise<EquipFailure[]> {
    let equipfailure = await knex.select().from('equipfailure').orderBy('time' , 'desc') 
    return equipfailure as any
  }


  /**
   *
   * @param equipfailure
   */
  public async add(equipfailure: ICRUDRecord): Promise<void> {
    let record = equipfailure as EquipFailure
    await knex('equipfailure').insert(record)
    return {} as any
  }


  /**
   *
   * @param equipfailure
   */
  public async update(equipfailure: ICRUDRecord): Promise<void> {
    await knex('equipfailure').where('id', equipfailure.id).update(equipfailure)
    return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('equipfailure').where('id', id).delete()
    return {} as any
  }

  public async addFailure(type: string, content: string, target: string): Promise<void> {
    let record = new EquipFailure(null)
    record.time = new Date()
    record.type = type
    record.content = content
    record.target = target
    await this.add(record)
  }

  public async insertError(content: string, target: string): Promise<void> {
    await this.addFailure(Failure_Error, content, target)
  }

  public async insertWarning(content: string, target: string): Promise<void> {
    await this.addFailure(Failure_Warning, content, target)
  }

  public async insertInfo(content: string, target: string): Promise<void> {
    await this.addFailure(Failure_Info, content, target)
  }
}

export default EquipFailureDao
