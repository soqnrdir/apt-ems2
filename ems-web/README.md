# APT-EMS 웹

## Table of contents

* [배포](#deployment)
* [개발팁](#development)

## <a name="deployment"/>Deployment

* Run Web Service with source code
- Run the server in development mode: `npm run start:dev`
- Build the project for production: `npm run build`.
- Run the production build: `npm start`.
- Run production build with a different env file npm start -- --env="name of env file"

* Production 버전 빌드 및 설치 방법
1) ems-app 앱 빌드
```
$ cd ../ems-app
$ npm run build
```
2) ems-web 빌드
```
$ npm run build
```

3) production 빌드 ems-web 실행
```
$ npm start
```

4) Linux 서비스 등록
```
npm install pm2 -g 
pm2 --name ems-web start npm -- start
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp $HOME
pm2 save
```

5) windows에서 자동 프로그램 시작 등록
```
npm install pm2 -g 
pm2 --name ems-web start npm -- start
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp $HOME
pm2 start win-startup.js --name apt-ems2
pm2 save
```


* 개발모드 ems-web와 ems-app 분리해서 실행

1) ems-web 실행
env/development.env 파일내 포트 번호 확인
```
$ export DEBUG=ems:*
$ npm run start:dev
```

2) ems-app development 모드로 실행
vue.config.js 파일내 포터 번호 확인
```
$ cd ../ems-app
$ npm run serve
```

* Access a web service with web browser

Open "http://<ip>:<port>" URL.  
Default user name is "admin" with no password.

## <a name="development"/>개발팁

### 타 서버의 python data 서버를 이용한 시험 방법
`ems-web/env/development.env` 파일의 DATA_PROXY 서버 주소를 localhost에서 python data 서버가 동작하는 주소로 변경
```
DATA_PROXY=http://localhost:3014
```

### curl을 이용해서 API 시험방법

* 인증 없이 API를 접근할 수 있게 설정 변경
```
# env/development.env 파일내 항목을 다음과 같이 설정후 디버그 모드로 서버 실행
AUTH_DISABLED=1
```

* curl을 이용 시험 특정 URI 호출 시험
```
curl -v http://localhost:3012/v1/tests/ems-test
```
### egauge 장비 설치

* egauge에서 EMS 서버에 계측데이터 PUSH 설정
`설정/일반설정` 페이지의 `데이터 공유` 항목에 다음과 같은 형식으로 URL 설정한다.  
`http:/<IP>:<Port>/v1/egauges/push-data?id=<regNo>`  
`<regNo>` 계측기 관리번호를 설정한다.

### Admin login API 시험방법

* 사용자 로그인 시험 방법
로그인을 수행하며 서버가 200을 반환한 경우 로그인 성공이다.
```
$ curl -S -v -X POST -H "Content-Type: application/json" \
  -d '{"adminId":"admin","password":""}'\
  http://localhost:3012/v1/auth/admin-login

{"result":{"id":"ix8So4Vv...sggq-So7FxJ_vpuY"}
```

* 로그인 정보 획득
로그인을 통해 얻음 TOKEN을 HTTP 요청 헤더에 넣어 서버로 부터 사용자 정보를 얻는다.
```
$ TOKEN="..."
$ curl -S -v -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:3012/v1/auth/admin-current
```

### API 시험

* 온습도 미세먼지 센서 push 방식 시험  
수신:
```
curl -v http://localhost:3012/v1/sensor/on-data
```
수동으로 시험 데이터 입력:
```
curl -v -X POST -H "Content-Type: application/json" \
  -d '{"type":"temp/humi","temp":25.6,"humi":38.44,"t":300}'\
  http://localhost:3012/v1/sensor/push-data?id=temp
curl -v -X POST -H "Content-Type: application/json" \
  -d '{"type":"PM","pm1.0":2.52,"pm2.5":3.26,"pm4.0":3.74,"pm10.0":3.84}'\
  http://localhost:3012/v1/sensor/push-data?id=pm
```

* 미터데이터 수신  
수신:
```
curl -v http://localhost:3012/v1/usage/on-data
```
수신 데이터:
```
data: {"meterId":9,"facilityId":1,"name":"급수펌프","time":"2021-09-29T07:58:00.000Z","energyWh":69.71,"energyW":250956.977,"meanW":0,"capacity":100}

data: {"meterId":1,"facilityId":2,"name":"냉각수 순환펌프","time":"2021-09-29T07:58:00.000Z","energyWh":35.885,"energyW":129184.482,"meanW":0,"capacity":100}


```
  * energyWh: 누적 전력량(kWh 단위)  
  * energyW: 누적 전력량  
  * meanW: 순시 전력(평균 변화율), 용량 대비 사용량 보여주는 용도로 사용됨  
  * capacityW: 설비 용량 해당 설비 최대 용량  

### postgresql에 DB 사용법

* `psql` 실행
```
"C:\Program Files\PostgreSQL\13\bin\psql" -U postgres
```

* ubuntu에서 psql 사용
```
$ sudo -i -u postgres
$ psql
```

* `ems_proto` DB의 owner가 될 `ems_user` 생성
```
postgres=# create user ems_user with password '87654321!';
CREATE ROLE
```

* `ems_user` 사용자 소유의 `ems_proto` DB 생성
```
postgres=# create database ems_proto with owner ems_user;
CREATE DATABASE
```

* 모든 데이터베이스 보기
```
postgres=# \l+
```

* `ems_user` 계정으로 `ems_proto` DB 접속
```
postgres# \c ems_proto ems_user
You are now connected to database "ems_proto" as user "ems_user".
```

* 모든 테이블 보기
```
ems_proto=# \dt+
                          릴레이션(relation) 목록
 스키마 |    이름    |  종류  |  소유주  | Persistence |    크기    | 설명
--------+------------+--------+----------+-------------+------------+------
 public | admins     | 테이블 | ems_user | permanent   | 8192 bytes |
 public | facilities | 테이블 | ems_user | permanent   | 0 bytes    |
 public | users      | 테이블 | ems_user | permanent   | 0 bytes    |
```

## Reference
