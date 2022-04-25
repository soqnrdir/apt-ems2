# python EMS data server

### run production server
```
$ waitress-serve --port=3014 --call ems_data_serv:create_app
```

### run development server
```
$ python ems_data_serv.py
```

### get server API help
```
$ curl -v http://localhost:3014/data/help
```

### 전력사용량 조회 예
```
$ curl -v "http://localhost:3014/data/usages?meterId=1&beginDate=1630230299&endDate=1630316699&freq=1H"
```

### windows에서 자동 프로그램 시작 등록
```
pm2 start waitress-serve --name ems-data-serv -- --port=3014 --call ems_data_serv:create_app
```
