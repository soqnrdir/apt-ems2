import Knex from 'knex'
import logger from '@shared/Logger'
import Debug from "debug"
import { now } from 'moment'
const debug = Debug("ems:daos")

/**
 * 테이블이 존재하지 않는 경우는 테이블을 생성한다.
 * @param knex Knex 인스턴스
 */
export async function checkToCreateTables(knex: Knex) {
  if (!(await knex.schema.hasTable('users'))) {
    debug("table creating: 'users'")
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary()
      table.dateTime('at').defaultTo(knex.fn.now())
      table.string('userId', 16).notNullable()
      table.string('name', 32).notNullable()
      table.string('email', 32)
      table.string('password')
      table.string('division', 32)
      table.string('phone', 16)
      table.string('perms', 16)
      table.dateTime('lastLogin')
      table.unique(['userId'])
    })
  }
  if (!(await knex.schema.hasTable('admins'))) {
    debug("table creating: 'admins'")
    await knex.schema.createTable('admins', (table) => {
      table.increments('id').primary()
      table.dateTime('at').defaultTo(knex.fn.now())
      table.string('adminId', 16).notNullable()
      table.string('name', 32).notNullable()
      table.string('email', 32)
      table.string('password')
      table.string('division', 32)
      table.string('phone', 16)
      table.string('perms', 16)
      table.dateTime('lastLogin')
      table.unique(['adminId'])
    })
    await knex('admins').insert({
      adminId: 'admin',
      name: '관리자',
      perms: '관리자'
    })
    await knex('admins').insert({
      adminId: 'tester',
      name: '시험자',
      perms: '사용자'
    })
  }
  if (!(await knex.schema.hasTable('facilities'))) {
    debug("table creating: 'facilities'")
    await knex.schema.createTable('facilities', (table) => {
      table.increments('id').primary()
      table.string('regNo', 16).notNullable()   // 관리번호
      table.string('name', 32).notNullable()    // 설비명
      table.string('location', 64)              // 설비위치
      table.string('regDate', 10).notNullable()  // 등록일(yymmdd)
      table.string('note', 128)                 // 비고
      table.string('type', 16)
      table.double('capacity')
      table.unique(['regNo'])
    })
  }

  if (!(await knex.schema.hasTable('sensor'))) {
    debug("table creating: 'sensor'")
    await knex.schema.createTable('sensor', (table) => {
      table.increments('id').primary()
      table.string('sensorType', 32).notNullable()   // 센서타입
      table.string('sensorName', 32).notNullable()    // 센서명
      table.string('location', 64)              // 설치위치
      table.string('regDate', 32).notNullable()  // 등록일(yymmdd)
      table.string('address', 32)		// 주소
      table.string('ipAddress', 32) 
      table.string('note', 128)     // 비고
      table.unique(['sensorName'])
    })
  }

  if (!(await knex.schema.hasTable('measurement'))) {
    debug("table creating: 'measurement'")
    await knex.schema.createTable('measurement', (table) => {
      table.increments('id').primary()
      table.string('regNo', 32).notNullable()   // 관리번호
      table.string('measureName', 32).notNullable() // 계측기명
      table.string('contype', 10)
      table.string('address', 32)              // 장치주소
      table.string('regDate', 10).notNullable()  // 등록일(yymmdd)
      table.string('modelName', 32)		// 모델병
      table.string('note', 128)       // 비고
      table.unique(['regNo'])
    })
  }

  if (!(await knex.schema.hasTable('meters'))) {
    debug("table creating: 'meters'")
    await knex.schema.createTable('meters', (table) => {
      table.increments('id').primary()
      table.string('regNo', 32).notNullable()   // 관리번호
      table.integer('facilityId').notNullable()    // 계측대상
      table.integer('measurementId').notNullable()    // 계측대상
      table.string('address', 32)		// 주소
      table.string('note', 128)     // 비고
      table.string('metername', 32)
      table.string('type' , 6)
      table.unique(['regNo'])
      table.foreign('facilityId').references('facilities.id')
      table.foreign('measurementId').references('measurement.id')
    })
  }

  if (!(await knex.schema.hasTable('usage'))) {
    debug("table creating: 'usage'")
    await knex.schema.createTable('usage', (table) => {
      table.dateTime('time').notNullable()
      table.double('energy').notNullable()
      table.integer('meterId').notNullable()
      table.foreign('meterId').references('meters.id')
      table.unique(['time','meterId'])
    })
  }

  // DR 사업자 DB 연계
  if (!(await knex.schema.hasTable('drusage'))) {
    debug("table creating: 'drusage'")
    await knex.schema.createTable('drusage', (table) => {
      table.dateTime('dateTime').notNullable()
      table.string('customerNo', 10).notNullable()  // 한전 고객번호
      table.integer('period').notNullable()
      table.double('usage').notNullable()           // kW 단위 전기사용량
      table.double('peakDemand').notNullable()      // 최대 사용량
      table.integer('meterId').notNullable()
      table.foreign('meterId').references('meters.id')
      table.unique(['customerNo','dateTime','meterId'])
    })
  }

  if (!(await knex.schema.hasTable('system'))) {
    debug("table creating: 'system'")
    await knex.schema.createTable('system', (table) => {
      table.increments('id').primary()
      table.string('location', 32)
      table.string('manager', 32)  
      table.integer('contractPower')
      table.string('checkDate', 32)
      table.string('drAddress', 32)
      table.integer('substationcapacity')
    })
    await knex('system').insert({
      location: '관리소',
      manager: '관리소장'
    })
  }

  if (!(await knex.schema.hasTable('monthusage'))) {
    debug("table creating: 'monthusage'")
    await knex.schema.createTable('monthusage', (table) => {
      table.increments('id').primary()
      table.string('date', 32)
      table.bigInteger('residentialUsage')  
      table.bigInteger('residentialRates')
      table.bigInteger('IndustrialUsage')
      table.bigInteger('IndustrialRates')
      table.bigInteger('streetLampUsage')
      table.bigInteger('streetLampRates')
      table.unique(['date'])
    })
  }

  if (!(await knex.schema.hasTable('environment'))) {
    debug("table creating: 'environment'")
    await knex.schema.createTable('environment', (table) => {
      table.dateTime('time').notNullable()
      table.double('value1') 
      table.double('value2')
      table.integer('sensorId').notNullable()
      table.foreign('sensorId').references('sensor.id')
      table.unique(['time', 'sensorId'])
    })
  }

  if (!(await knex.schema.hasTable('equipfailure'))) {
    debug("table creating: 'equipfailure'")
    await knex.schema.createTable('equipfailure', (table) => {
      table.increments('id').primary()
      table.dateTime('time').notNullable()
      table.string('type', 32)  
      table.string('content', 256)
      table.string('target', 32)
    })
  }

  if (!(await knex.schema.hasTable('drdatas'))) {
    debug("table creating: 'drdatas'")
    await knex.schema.createTable('drdatas', (table) => {
      table.increments('id').primary()
      table.dateTime('time').notNullable()
      table.dateTime('starttime')
      table.dateTime('endtime')
      table.double('reductionRate')  
      table.string('note', 256)
    })
  }
}
