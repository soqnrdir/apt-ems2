import logging
from flask import Flask, request, jsonify, Response, g
from pg_db import PG_DB, Usages, Environments
from datetime import datetime, timedelta
from urllib.parse import urlparse

logger = logging.getLogger(__name__)
app = Flask(__name__)
app.config.from_pyfile('config.py')
#app.logger.setLevel(level=logging.INFO)

@app.route('/data/help')
def help():
    cmd_list = []
    begin_time = datetime.now().replace(hour=0, minute=0, second=0)
    end_time = begin_time + timedelta(days=1) - timedelta(seconds=1)
    cmd_list.append(f'data/usages?meterId=1&beginDate={int(begin_time.timestamp())}&endDate={int(end_time.timestamp())}&freq=1H&unit=wh&fill')
    return jsonify(cmd_list)

@app.route('/data/usages')
def usages():
    '''
    query parameters:
    - freq:
        M: Month (ex> M --> a mouth)
        W: Week
        D: Day
        H: Hour
        T: minute
    - unit:
        w: watt unit
        wh: watt per hour
    example> "http://localhost:3014/data/usages?meterId=1&beginDate=1630230299&endDate=1630316699&freq=1H&uint=w"
    '''
    try:
        meterId = request.args.get('meterId')
        beginDate = int(request.args.get('beginDate'))
        endDate = int(request.args.get('endDate'))
        if beginDate > endDate:
            return jsonify({'error': 'invalid range of begin and end date'})
        freq = request.args.get('freq')
        unit = request.args.get('unit')
        fill = request.args.get('fill')
        begin_date = datetime.fromtimestamp(beginDate)
        end_date = datetime.fromtimestamp(endDate)
        logger.info(f'usages: time={begin_date}~{end_date} freq={freq}')
        usages = Usages(get_db())
        if fill is None:
            df = usages.resample(meterId, begin_date, end_date, freq, unit == 'wh')
        else:
            df = usages.fill_resample(meterId, begin_date, end_date, freq, unit == 'wh')
        return Response(df.to_json(orient="split"), mimetype='application/json')
    except BaseException as e:
        logger.error(f'error in usages: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/data/meters-usages')
def meters_usages():
    '''
    query parameters:
    - freq:
        M: Month (ex> M --> a mouth)
        W: Week
        D: Day
        H: Hour
        T: minute
    - unit:
        w: watt unit
        wh: watt per hour
    example> "http://localhost:3014/data/meters-usages?meters=1,2,3&beginDate=1630230299&endDate=1630316699&freq=1H&uint=w"
    '''
    try:
        meters_str = request.args.get('meters')
        meters = map(lambda x: int(x), meters_str.split(','))
        beginDate = int(request.args.get('beginDate'))
        endDate = int(request.args.get('endDate'))
        if beginDate > endDate:
            return jsonify({'error': 'invalid range of begin and end date'})
        freq = request.args.get('freq')
        unit = request.args.get('unit')
        fill = request.args.get('fill')
        begin_date = datetime.fromtimestamp(beginDate)
        end_date = datetime.fromtimestamp(endDate)
        logger.info(f'meters-usages: meters={meters_str} time={begin_date}~{end_date} freq={freq}')
        usages = Usages(get_db())
        for i, meterId in enumerate(meters):
            if fill is None:
                df = usages.resample(meterId, begin_date, end_date, freq, unit == 'wh')
            else:
                df = usages.fill_resample(meterId, begin_date, end_date, freq, unit == 'wh')
           # 하나의 데이터셋에 여러 메터를 보내기 위해 Meter ID를 붙여서 필드 이름을 붙임
            energy_column = f'{meterId}#energy'
            delta_column = f'{meterId}#delta'
            df.rename(columns = {'energy': energy_column, 'delta': delta_column}, inplace = True)
            if i == 0:
                meters_df = df
            else:
                meters_df[energy_column] = df[energy_column]
                meters_df[delta_column] = df[delta_column]
        return Response(meters_df.to_json(orient="split"), mimetype='application/json')
    except BaseException as e:
        return jsonify({'error': str(e)}), 500
        logger.error(f'error in usages: {e}')

@app.route('/data/environments')
def environments():
    '''
    query parameters:
    - freq:
        M: Month (ex> 1M --> a mouth)
        W: Week
        D: Day
        H: Hour
        T: minute
    example> "http://localhost:3014/data/environments?sensorId=1&beginDate=1630230299&endDate=1630316699&freq=1H"
    '''
    try:
        sensorId = request.args.get('sensorId')
        beginDate = int(request.args.get('beginDate'))
        endDate = int(request.args.get('endDate'))
        if beginDate > endDate:
            return jsonify({'error': 'invalid range of begin and end date'})
        freq = request.args.get('freq')
        fill = request.args.get('fill')
        begin_date = datetime.fromtimestamp(beginDate)
        end_date = datetime.fromtimestamp(endDate)
        logger.info(f'environment: time={begin_date}~{end_date} freq={freq}')
        envs = Environments(get_db())
        if fill is None:
            df = envs.resample(sensorId, begin_date, end_date, freq)
        else:
            df = envs.fill_resample(sensorId, begin_date, end_date, freq)
        return Response(df.to_json(orient="split"), mimetype='application/json')
    except BaseException as e:
        logger.error(f'error in environment: {e}')
        return jsonify({'error': str(e)}), 500

def get_db():
    if 'db' not in g:
        db_url = app.config['DATABASE_URL']
        parts = urlparse(db_url)
        g.db = PG_DB(parts.hostname, parts.port, parts.path[1:], parts.username, parts.password)
    return g.db

@app.teardown_appcontext
def teardown_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close_db()

@app.after_request
def after_request(response):
    logger.info(
            '%s [%s] "%s %s" %s %s %s %s',
            request.remote_addr,
            datetime.now().strftime("%d/%b/%Y %H:%M:%S"),
            request.method,
            request.full_path,
            response.status,
            response.content_length,
            request.referrer,
            request.user_agent,
        )
    return response

debug = app.config['DEBUG']
def create_app():
    if debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)
    return app

if __name__ == "__main__":
    app = create_app()
    host = app.config['HOST']
    port = app.config['PORT']
    logger.info(f'listening: host={host} port={port}')
    app.run(host=host, port=port, debug=debug)
