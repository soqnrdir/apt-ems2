import './LoadEnv'; // Must be the first import
import Debug from "debug";
const debug = Debug("ems:index")
import app from './Server';
import logger from '@shared/Logger';
import {Database, Server} from './Config'
import {openDatabase} from '@daos/Instance'
import emsChecker from './EMS'
import failure from '@EMS/Failure'

async function connectDatabase () {
  debug(`connect database: ${Database.driver}`)
  const knexInstance = await openDatabase(Database.driver)

  // DB가 정상적으로 접속됐는지 확인하고 진행하기 위해서
  // 테이블을 검색해본다.
  // SELECT COUNT(*) from users;
  const numUsers = await knexInstance.count().from('users')
}

// EMS 컨텐츠 체크
async function loadEMSData() {
  debug(`loadEMSData`)
  await emsChecker.loadInitialData()
}

Promise.all([
  connectDatabase(),
]).then((results) => {
  loadEMSData() // connectDatabase() 완전히 끝난후 수행해야 DB instance를 획득할 수 있음
  emsChecker.startChecker()
  app.listen(Server.port, () => {
    failure.info(`EMS 서버 시작됨`, '시스템');
    logger.info(`Web server started on port: ${Server.port}`);
  })
}).catch((error) => {
  logger.error('app error:', error)    
})
