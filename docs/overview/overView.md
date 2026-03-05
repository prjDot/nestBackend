# 주식 알림 앱 - stock

## 0. 목표

* Google 로그인 기반으로 빠르게 진입
* 관심 종목 + 가격 알림 + 시장 급등락 + 뉴스 요약까지 “한 앱”에서 제공
* 한국/글로벌 확장 가능하되, **API/도메인 분리를 먼저 고정**

---

## 1. 도메인 모델

### 1.1 User

* `uid` (string) : Google sub(고유 ID)
* `email` (string)
* `displayName` (string)
* `photoURL` (string | null)
* `createdAt` (datetime)
* `lastLoginAt` (datetime)
* `notificationEnabled` (boolean) *서버 저장용 상태*
* `locale` (string, e.g. `ko-KR`)
* `theme` (`system|light|dark`)

### 1.2 Instrument (종목 마스터)

* `symbol` (string) : `AAPL`, `005930` 등
* `name` (string) : `Apple Inc`, `삼성전자`
* `market` (`US|KR|...`)
* `exchange` (string) : `NASDAQ`, `KOSPI`
* `type` (`stock|etf|index|...`)

### 1.3 WatchlistItem

* `userId` (string)
* `symbol` (string)
* `addedAt` (datetime)
* `customOrder` (number | null)

제약:

* max 50 items/user

### 1.4 PriceAlert

* `alertId` (string)
* `userId` (string)
* `symbol` (string)
* `alertType` (`target|rise|fall|range`)
* `targetPrice` (number | null)
* `changeRate` (number | null) : %
* `rangeMin` (number | null)
* `rangeMax` (number | null)
* `isActive` (boolean)
* `triggerCount` (number)
* `lastTriggeredAt` (datetime | null)
* `createdAt` (datetime)

제약(기본값):

* 동일 조건 재발송 최소 1시간 간격
* 1일 최대 알림 20회/user

### 1.5 NotificationLog

* `id`
* `userId`
* `symbol`
* `title`
* `body`
* `deepLink`
* `status` (`sent|delivered|opened|failed`)
* `readAt` (datetime | null)
* `createdAt`

보관:

* 최근 90일

### 1.6 Broker / UserBrokerPreference

**Broker**

* `brokerId`
* `name`
* `logoUrl`
* `baseCommission` (%)
* `eventCommission` (% | null)
* `eventEndDate` (date | null)
* `eventCondition` (string | null)
* `agencyFee` (%)
* `minFee` (number | null)
* `channels` `{ mts, hts, phone }` (각 %)
* `appStoreUrl`
* `updatedAt`

**UserBrokerPreference**

* `userId`
* `brokerId`
* `order` (number)

---

## 2. 인증/세션 (Google OAuth2 + JWT)

### 2.1 권장 플로우(서버 중심)

1. FE → `GET /api/auth/google`
2. BE → Google authorize redirect
3. Google → `GET /api/auth/google/callback?code&state`
4. BE: code ↔ token 교환 + `id_token` 검증
5. BE: **서비스 JWT 발급** + FE로 redirect

### 2.2 로그아웃

* `POST /api/auth/logout`

  * 옵션: `scope=local|all` (기기 로그아웃 vs 전체 로그아웃)

---

## 3. API 도메인 분류 (REST)

### 3.1 Auth

* `GET /auth/google`
* `GET /auth/google/callback`
* `POST /auth/logout`
* `DELETE /auth/account`

### 3.2 Users (내 설정)

* `GET /users/me`
* `PATCH /users/me`

  * `displayName`, `photoURL`, `locale`, `theme`, `notificationEnabled`

### 3.3 Devices (푸시 토큰/권한 상태)

* `POST /devices` (FCM token 등록)
* `PATCH /devices/:id` (permission 상태 업데이트)
* `DELETE /devices/:id`

### 3.4 Instruments (검색)

* `GET /instruments/search?q=&type=name|code&market=KR|US`
* `GET /instruments/autocomplete?q=&limit=10`
* `GET /instruments/popular?market=KOSPI|KOSDAQ`
* `GET /instruments/:symbol`

### 3.5 SearchHistory (최근 검색)

* `GET /search/history?limit=10`
* `POST /search/history` (symbol 저장)
* `DELETE /search/history/:id`
* `DELETE /search/history` (전체 삭제)

> “최근 검색 10개 로컬 저장”이면 서버 API 없이 FE 로컬만으로도 가능.
> 기기 간 동기화를 원하면 서버로 올린다.

### 3.6 Watchlist (관심 종목)

* `POST /watchlist` `{ symbol }`
* `GET /watchlist?sort=added|price|change&order=asc|desc`
* `DELETE /watchlist/:symbol`

### 3.7 Quotes (시세)

* `GET /quotes/:symbol`
* `GET /quotes?symbols=AAPL,005930` (홈/관심종목 벌크)

업데이트 정책(표시용):

* 장중: 15초
* 장외: 10분

### 3.8 Fundamentals (지표)

* `GET /fundamentals/:symbol`

  * 시총, PER/PBR, 배당 등

### 3.9 Charts (OHLCV)

* `GET /charts/:symbol?range=1d|1w|1m|3m|6m|1y|all&interval=5m|1d|1w|1mo`
* MA 오버레이는 기본적으로 FE 계산 가능(OHLCV 기반)

### 3.10 Analytics (가격 위치/구간/변동성)

* `GET /analytics/:symbol/price-position?window=1y` (52주 high/low/avg + 현재 위치)
* `GET /analytics/:symbol/returns?range=...`
* `GET /analytics/:symbol/volatility?range=...`
* `GET /analytics/:symbol/moving-averages?windows=5,20,60,120`

### 3.11 Alerts (가격 알림 CRUD)

* `POST /alerts`
* `GET /alerts?symbol=&type=&active=`
* `PATCH /alerts/:id`
* `DELETE /alerts/:id`

### 3.12 Notifications (알림 이력)

* `GET /notifications?unreadOnly=`
* `PATCH /notifications/:id` (read 처리)

### 3.13 Market (시장 요약/급등락)

* `GET /market/summary?market=KR|US`
* `GET /market/movers?market=KOSPI|KOSDAQ&type=gainers|losers&limit=10`
* `GET /market/volume-spike?market=...&threshold=300&limit=10`

### 3.14 News

* `GET /news?symbol=&limit=20`
* `GET /news/latest?market=KR|US`
* `POST /news/:id/summarize` *(옵션: 요약/감성 분석)*

### 3.15 Home (BFF)

* `GET /home`

  * 관심종목 상위 N + 시장요약 + 급등락 + 최근 확인 종목

### 3.16 Brokers (수수료)

* `GET /brokers`
* `GET /brokers/compare?symbol=&qty=10&includeAgencyFee=true`
* `PATCH /brokers/preferences` (즐겨찾기 3개)
* `GET /brokers/recommendation?symbol=`

---

## 4. UI/UX 제약(명시용)

### Watchlist

* max 50
* 정렬: `added|price|change`
* 삭제: 스와이프 + confirm

### Alerts

* 타입별 파라미터 강제:

  * `target` → `targetPrice`
  * `rise/fall` → `changeRate`
  * `range` → `rangeMin/rangeMax`
* 트리거 쿨다운: 1시간
* 1일 최대: 20회(기본)

### News

* 원문 링크는 항상 제공
* 요약/감성은 옵션(비용/지연 고려)

---

## 5. MVP 우선순위(개발 순서 추천)

1. Auth + Users + Devices(FCM)
2. Instruments(Search) + Quotes + Charts(기초)
3. Watchlist + Alerts + NotificationLog
4. Market(Home) + Movers + Volume Spike
5. News(+요약은 나중)
6. Analytics / Stats / Brokers(후순위)

---

## 6. TODO / 위험 포인트(명확히)

* 시세/차트/지표 데이터 공급자 선택(US/KR 분리 가능성)
* 학교망/서버리스 환경에서 외부 API IP 제한 이슈(카카오 때처럼) → egress 전략 필요
* 뉴스 크롤링은 법/정책/차단 리스크 있음 → 가능한 공식 API 우선

---