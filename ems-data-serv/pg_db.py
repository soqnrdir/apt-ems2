import logging
import numpy as np
from pandas.core.frame import DataFrame
import psycopg2
from urllib.parse import urlparse
import unittest
from datetime import datetime, timedelta
import pandas as pd
import pytz

logger = logging.getLogger(__name__)

CURRENT_TZ = 'Asia/Seoul'

class PG_DB:
    def __init__(self, host: str, port: int, db_name: str, user: str, password: str):
        '''Initilizes DataBase object with attributes:
        Args:
            host (str): database server address
            port (int): port number(default: 5432)
            db_name (str): database name
            user (str): user id
            password (str): user password
        '''
        logger.debug(f'db loading...: host={host} db_name={db_name} user={user} password={password} port={port}')
        self.conn = psycopg2.connect(host=host, dbname=db_name, user=user, password=password, port=port)

    def execute(self, query, input_tuple = None):
        '''Executes query, uses input_tuple if given
        Args:
            query (str): SQLite query
            input_tuple (Tuple): input parameters for the query if required
        '''
        c = self.conn.cursor()
        if input_tuple:
            c.execute(query, input_tuple)
        else:
            c.execute(query)
        self.conn.commit()

    def get_ls_rows(self, query, input_tuple = None):
        '''Executes query, uses input_tuple if given, returns rows fetched
        Args:
            query (str): SQLite query
            input_tuple (Tuple): input parameters for the query if required
        Returns:
            ls_rows (List):
                tup (Tuple)
        '''
        ls_rows = []
        c = self.conn.cursor()
        if input_tuple:
            c.execute(query, input_tuple)
        else:
            c.execute(query)
        for row in c.fetchall():
            ls_rows.append(row)
        return ls_rows

    def close_db(self):
        logger.debug('db closing...')
        self.conn.close()

class Usages:
    QUERY_FMT = "SELECT time, energy FROM usage WHERE \"meterId\"={} AND time>='{}' AND time<='{}' ORDER BY time"
    QUERY_GET_LAST_FMT = "SELECT time, energy FROM usage WHERE \"meterId\"={} AND time<'{}' ORDER BY time DESC LIMIT 1"
    
    def __init__(self, db: PG_DB):
        self.db = db

    def last_energy_(self, meter_id: str, date: datetime):
        """ date ?????? ???????????? ?????? ????????? ????????? ???????????? ????????????. """
        query = f"SELECT time, energy FROM usage WHERE \"meterId\"={meter_id} AND time<'{date}' ORDER BY time DESC LIMIT 1"
        rows = self.db.get_ls_rows(query)
        #print(query, '-->', rows)
        if len(rows) > 0:
            return rows[0]

    def resample(self, meter_id: str, begin_date: datetime, end_date: datetime, rule: str, in_wh: bool) -> DataFrame:
        query = self.QUERY_FMT.format(meter_id, begin_date, end_date)
        df = pd.read_sql(query, self.db.conn, index_col=['time'], parse_dates=True)
        df_result = df.resample(rule).last()
        first_energy = df_result.iloc[0]['energy']
        if in_wh: # w?????? 3600?????? ????????? ???????????????(Wh) ????????? ?????? 
            df_result['energy'] = df_result['energy'].div(3600).round(0)
        df_result['delta'] = df_result['energy'].diff()
        prev_record = self.last_energy_(meter_id, begin_date)
        if prev_record:
            diff_secs = begin_date.timestamp() - prev_record[0].timestamp()
            if diff_secs < 24 * 3600:   # ?????? ?????? ?????? ?????? ?????? ???????????? ?????? ????????? ????????? ????????? delta??? ??????
                delta = first_energy - prev_record[1]
                if in_wh:
                    df_result.iloc[0, df_result.columns.get_loc('delta')] = np.round(delta / 3600, 0)
                else:
                    df_result.iloc[0, df_result.columns.get_loc('delta')] = delta
        logger.info(f'query={query} total={df.shape[0]} sample={df_result.shape[0]}')
        return df_result

    @staticmethod
    def align_minute(ts):
        remain = int(ts) % 60
        return int(ts) - remain

    def fill_resample(self, meter_id: str, begin_date: datetime, end_date: datetime, rule: str, in_wh: bool) -> DataFrame:
        """
        ?????? ????????? ???????????? ???????????? ???????????? ???????????? ????????? ??????
        """
        query = self.QUERY_FMT.format(meter_id, begin_date, end_date)
        df = pd.read_sql(query, self.db.conn, index_col=['time'], parse_dates=True)
        begin_date_ts = pd.Timestamp(Usages.align_minute(begin_date.timestamp()), unit='s', tz=pytz.timezone(CURRENT_TZ))
        # DB?????? ???????????? ???????????? ???????????? ?????????
        # align_minute() ????????? ???????????? ??? ?????? ???????????? ?????????????????? ???????????? raw ???????????? ????????? ?????????
        end_date_ts = pd.Timestamp(Usages.align_minute(end_date.timestamp()), unit='s', tz=pytz.timezone(CURRENT_TZ))
        if df.index.shape[0] == 0:
            df.loc[begin_date_ts] = np.NaN
            df.loc[end_date_ts] = np.NaN
            df_result = df.resample(rule).last()
            df_result['delta'] = np.NaN
            return df_result
        df.index = df.index.tz_convert(CURRENT_TZ)
        if df.index[0] != begin_date_ts:
            df.loc[begin_date_ts] = np.NaN
        if df.index[-1] != end_date_ts:
            df.loc[end_date_ts] = np.NaN
        df_result = df.resample(rule).last()
        # ????????? delta??? ????????? ????????????, ????????? ????????? ?????? ?????? ??? ??????
        first_energy = df_result.iloc[0]['energy']
        if in_wh: # w?????? 3600?????? ????????? ???????????????(Wh) ????????? ?????? 
            df_result['energy'] = df_result['energy'].div(3600).round(0)
        df_result['delta'] = df_result['energy'].diff()
        prev_record = self.last_energy_(meter_id, begin_date)
        if prev_record:
            diff_secs = begin_date_ts.timestamp() - prev_record[0].timestamp()
            if diff_secs < 24 * 3600:   # ?????? ?????? ?????? ?????? ?????? ???????????? ?????? ????????? ????????? ????????? delta??? ??????
                delta = first_energy - prev_record[1]
                if in_wh:
                    df_result.iloc[0, df_result.columns.get_loc('delta')] = np.round(delta / 3600, 0)
                else:
                    df_result.iloc[0, df_result.columns.get_loc('delta')] = delta
        #logger.info(f'query={query} total={df.shape[0]} sample={df_result.shape[0]}')
        return df_result

# IoT ?????? ????????? ????????? ?????? ?????????
class Environments:
    QUERY_FMT = "SELECT time, value1, value2 FROM environment WHERE \"sensorId\"={} AND time>='{}' AND time<='{}' ORDER BY time"
    
    def __init__(self, db: PG_DB):
        self.db = db

    def resample(self, meter_id: str, begin_date: datetime, end_date: datetime, rule: str) -> DataFrame:
        query = self.QUERY_FMT.format(meter_id, begin_date, end_date)
        df = pd.read_sql(query, self.db.conn, index_col=['time'], parse_dates=True)
        df_result = df.resample(rule).last()
        logger.info(f'query={query} total={df.shape[0]} sample={df_result.shape[0]}')
        return df_result

    @staticmethod
    def align_minute(ts):
        remain = int(ts) % 60
        return int(ts) - remain

    def fill_resample(self, meter_id: str, begin_date: datetime, end_date: datetime, rule: str) -> DataFrame:
        """
        ?????? ????????? ???????????? ???????????? ???????????? ???????????? ????????? ??????
        """
        query = self.QUERY_FMT.format(meter_id, begin_date, end_date)
        df = pd.read_sql(query, self.db.conn, index_col=['time'], parse_dates=True)
        begin_date_ts = pd.Timestamp(Usages.align_minute(begin_date.timestamp()), unit='s', tz=pytz.timezone(CURRENT_TZ))
        # DB?????? ???????????? ???????????? ???????????? ?????????
        # align_minute() ????????? ???????????? ??? ?????? ???????????? ?????????????????? ???????????? raw ???????????? ????????? ?????????
        end_date_ts = pd.Timestamp(Usages.align_minute(end_date.timestamp()), unit='s', tz=pytz.timezone(CURRENT_TZ))
        if df.index.shape[0] == 0:
            df.loc[begin_date_ts] = np.NaN
            df.loc[end_date_ts] = np.NaN
            df_result = df.resample(rule).last()
            return df_result
        df.index = df.index.tz_convert(CURRENT_TZ)
        if df.index[0] != begin_date_ts:
            df.loc[begin_date_ts] = np.NaN
        if df.index[-1] != end_date_ts:
            df.loc[end_date_ts] = np.NaN
        df_result = df.resample(rule).mean()
        #logger.info(f'query={query} total={df.shape[0]} sample={df_result.shape[0]}')
        return df_result

class DBTest(unittest.TestCase):
    DB_PATH = 'postgresql://ems_user:87654321!@192.168.5.144:5432/ems_proto'

    def __init__(self, *args, **kwargs):
        logging.basicConfig(level=logging.DEBUG)
        super().__init__(*args, **kwargs)
        parts = urlparse(self.DB_PATH)
        self.db = PG_DB(parts.hostname, parts.port, parts.path[1:], parts.username, parts.password)

    def testSelect(self):
        meter_id = 1
        end_time = datetime.now()
        begin_time = end_time - timedelta(minutes=5)
        query = Usages.QUERY_FMT.format(meter_id, begin_time, end_time)
        print(query)
        #df = pd.read_sql(query, self.db.conn)
        #print(df)
        #df['delta'] = df['energy'].diff()
        #df.drop('meter_id', axis=1, inplace=True)
        #print(df.to_json())
        df = pd.read_sql(query, self.db.conn, index_col=['time'], parse_dates=True)
        df['delta'] = df['energy'].diff()
        #print(df.to_json())
        print(df.to_json(orient="split"))
        '''
{
  "columns": [
    "energy",
    "delta"
  ],
  "index": [
    1630304220000,
    1630304280000,
    1630304340000,
    1630304400000,
    1630304460000
  ],
  "data": [
    [
      91978960.0,
      null
    ],
    [
      91981464.0,
      2504.0
    ],
    [
      91983976.0,
      2512.0
    ],
    [
      91986464.0,
      2488.0
    ],
    [
      91988910.0,
      2446.0
    ]
  ]
}
        '''

if __name__ == '__main__':
    unittest.main()
