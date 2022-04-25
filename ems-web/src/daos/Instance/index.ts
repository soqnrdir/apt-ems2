import DataProvider from './DataProvider'
import Knex from 'knex'
import { checkToCreateTables } from './Schema'

export var knex : Knex

export async function openDatabase(dbClient: string) {
  knex = await DataProvider.create(dbClient)
  await checkToCreateTables(knex)
  return knex
}
