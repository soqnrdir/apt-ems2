/* tslint:disable await-promise */
import Knex from 'knex'
import {Database} from '../../Config'
import Debug from "debug"
const debug = Debug("ems:daos")

/**
 * Initialize a new Postgres provider
 */
export async function create () {
  let connection = {
    user: Database.user,
    password: Database.password,
    host: Database.host,
    port: parseInt(Database.port),
    database: Database.database
  }
  debug(`connectng pg with ${JSON.stringify(connection)}`)
  const knex = Knex({
    client: 'pg',
    connection: connection,
    pool: {
      min: Database.poolMin,
      max: Database.poolMax,
      idleTimeoutMillis: Database.poolIdle
    },
    acquireConnectionTimeout: 2000
  })

  // Verify the connection before proceeding
  try {
    await knex.raw('SELECT now()')

    return knex
  } catch (error) {
    throw new Error(`Unable to connect to Postgres: ${error}`)
  }
}

export default {create}
