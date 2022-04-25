import Knex from 'knex'
import fs from 'fs'
import path from 'path'
import logger from '@shared/Logger'
import Debug from "debug"
const debug = Debug("ems:daos")
import {Database} from '../../Config'

/**
 * Initialize a new Sqlite3 provider
 */
export async function create () {
  // create DB folder in case of not exist
  debug(`sqlite3: filename=${Database.filename}`)
  var dbDir = path.dirname(Database.filename)
  fs.mkdirSync(dbDir, { recursive: true })

  const knex = Knex({
    client: 'sqlite3',
    connection: {
      filename: Database.filename
    },
    useNullAsDefault: true
  })

  try {
    // Verify the connection before proceeding
    await knex.raw('SELECT date("now")')

    return knex
  } catch (error) {
    logger.error('DB connect error:', error)
    throw new Error(`Unable to connect to sqlite3. ${error}`)
  }
}

export default {create}
