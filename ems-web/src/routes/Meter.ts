import { Request, Response, Router } from "express";
import { BAD_REQUEST, CREATED, OK } from "http-status-codes";
import { ParamsDictionary } from "express-serve-static-core";
import { authenticate, RequestWithAuth } from '../Middleware'
import { MakeCRUDRoutes } from "./RouteUtil";

import MeterDao from "@daos/MeterDao";
import { paramMissingError } from "@shared/constants";
import Debug from "debug";
const debug = Debug("ems:meters");
import logger from "@shared/Logger";
import { knex } from '@daos/Instance'

const router = Router();
const meterDao = new MeterDao();

MakeCRUDRoutes("meters", router, meterDao);

router.get(
  "/list-query",
  authenticate,
  async (req: RequestWithAuth, res: Response) => {
      let meterId = req.query['id'] as string | null
    //debug(`query=${JSON.stringify(req.query)}`)
    try {
        let records = await knex.select({id:'meters.id'},{metername:'meters.metername'},{meterRegNo: 'meters.regNo'},{name: 'facilities.name'}, {meterAddress: 'meters.address'}
                                       ,{measureName :'measurement.measureName'},{meterType: 'meters.type'},{note:'meters.note'},'meters.facilityId', 'meters.measurementId')
                                .from('meters')
                                .join('facilities', 'meters.facilityId', '=', 'facilities.id')
                                .join('measurement','meters.measurementId', '=', 'measurement.id')
                                .orderBy('meters.regNo');
      //debug(`records: ${JSON.stringify(records)}`);
      return res.status(OK).json({ records: records });
    } catch (ex) {
      debug(`[usage] exception: ${ex}`);
      return res.status(BAD_REQUEST).json({ result: ex.message });
    }
  }
);

router.get(
  "/main-meterid",
  authenticate,
  async (req: RequestWithAuth, res: Response) => {
      debug(`query=${JSON.stringify(req.query)}`)
    try {
        let records = await knex.select({id:'meters.id'} , {name:'facilities.name'} , {type:'facilities.type'})
                                .from('meters')
                                .join('facilities', 'meters.facilityId', '=', 'facilities.id')
                                .whereIn('facilities.type', ['메인', '변압기' , '공용변압기'])
                                .orderBy('meters.regNo');
      debug(`records: ${JSON.stringify(records)}`);
      return res.status(OK).json({ records: records });
    } catch (ex) {
      debug(`[usage] exception: ${ex}`);
      return res.status(BAD_REQUEST).json({ result: ex.message });
    }
  }
);

router.get(
  "/sub-meterid",
  authenticate,
  async (req: RequestWithAuth, res: Response) => {
      debug(`query=${JSON.stringify(req.query)}`)
    try {
        let records = await knex.select({id:'meters.id'}, {name:'facilities.name'}, {type:'facilities.type'})
                                .from('meters')
                                .join('facilities', 'meters.facilityId', '=', 'facilities.id')
                                .where('facilities.type', '주요계통')
                                .orderBy('meters.regNo');
      debug(`records: ${JSON.stringify(records)}`);
      return res.status(OK).json({ records: records });
    } catch (ex) {
      debug(`[usage] exception: ${ex}`);
      return res.status(BAD_REQUEST).json({ result: ex.message });
    }
  }
);

router.get(
  "/search-facilityId",
  authenticate,
  async (req: RequestWithAuth, res: Response) => {
      let meterId = req.query['id'] as string | null
      debug(`query=${JSON.stringify(req.query)}`)
    try {
        let records = await knex.select({id:'meters.id'}, {name:'facilities.name'})
                                .from('meters')
                                .join('facilities', 'meters.facilityId', '=', 'facilities.id')
                                .orderBy('meters.regNo');
      debug(`records: ${JSON.stringify(records)}`);
      return res.status(OK).json({ records: records });
    } catch (ex) {
      debug(`[usage] exception: ${ex}`);
      return res.status(BAD_REQUEST).json({ result: ex.message });
    }
  }
);
export default router;
