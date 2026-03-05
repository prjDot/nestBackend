아래는 네 기능 목록을 **REST API 도메인 단위로 쪼개서** 정리한 것입니다. (모바일 앱 기준 / 인증은 JWT 또는 세션 전제)

---

# 0. 공통 규칙

* Base: `/api`
* 인증 필요: `Authorization: Bearer <JWT>` 또는 HttpOnly Cookie
* 응답 표준: `{ ok, status, data, error, meta }` (너가 쓰는 형태 그대로)

---

# 1. Auth (소셜 로그인/세션) -> complete
## 엔드포인트

* `GET /auth/google` → Google로 redirect
* `GET /auth/google/callback` → code 교환, JWT/쿠키 세팅, FE로 redirect
* `POST /auth/logout` → 세션/리프레시 폐기
* `DELETE /auth/account` → 계정 삭제(회원 탈퇴)

## 포함 기능

* 계정 기능
* 소셜 로그인(Google)
* 로그아웃
* 계정 삭제

---

# 2. Users (유저 프로필/환경설정)

## 엔드포인트

* `GET /users/me` → 내 정보
* `PATCH /users/me` → 사용자 설정 업데이트

## 포함 기능

* 사용자 설정 관리
* 다크모드 / 언어 설정 등(“계정 설정” 전반)

> 알림 권한(푸시 permission)은 OS 레벨이라 **서버는 “권한 상태 저장”만** 하는 편이 안전.

---

# 3. Devices (푸시 토큰/알림 권한 상태)

## 엔드포인트

* `POST /devices` → 디바이스 등록(푸시 토큰 포함)
* `PATCH /devices/:deviceId` → 푸시 허용/거부 상태 업데이트
* `DELETE /devices/:deviceId` → 디바이스 제거

## 포함 기능

* 알림 권한 설정(서버에 상태 저장)
* 푸시 알림을 위한 토큰 관리

---

# 4. Instruments (종목 마스터/검색)

## 엔드포인트

* `GET /instruments/search?q=...&type=name|code`
* `GET /instruments/autocomplete?q=...`
* `GET /instruments/popular` → 인기 종목
* `GET /instruments/:symbol` → 종목 기본 정보(이름/코드/거래소 등)

## 포함 기능

* 종목 검색(이름/코드)
* 자동완성
* 인기 종목 표시

---

# 5. Search History (최근 검색 기록)

## 엔드포인트

* `GET /search/history`
* `POST /search/history` (body: `{ symbol, query }`)
* `DELETE /search/history/:id`
* `DELETE /search/history` → 전체 삭제

## 포함 기능

* 최근 검색 기록

---

# 6. Watchlist / Favorites (관심 종목=찜)

## 엔드포인트

* `POST /watchlist` (body: `{ symbol }`) → 찜하기
* `GET /watchlist?sort=added|price|change&order=asc|desc`
* `DELETE /watchlist/:symbol` → 찜 삭제

## 포함 기능

* 관심 종목(찜)
* 찜 리스트 조회/삭제
* 정렬(가격/변동률/추가순)

> 가격/변동률 정렬은 “실시간 시세”가 필요해서, 보통 BE에서 join/캐시로 처리하거나 FE가 받아서 정렬.

---

# 7. Quotes (현재가/시세)

## 엔드포인트

* `GET /quotes/:symbol` → 현재가, 전일대비, 시가/고가/저가, 거래량 등
* `GET /quotes?symbols=AAPL,005930` → 홈/관심종목용 벌크

## 포함 기능

* 현재가 조회
* 전일 대비 변동률
* 시가/고가/저가
* 거래량

---

# 8. Fundamentals (재무/지표: 시총, PER/PBR, 배당)

## 엔드포인트

* `GET /fundamentals/:symbol` → 시총, PER/PBR, 배당 등

## 포함 기능

* 시가총액
* PER/PBR
* 배당 정보

> 데이터 공급자에 따라 업데이트 주기가 다르니 캐시 정책을 분리하는 게 좋음.

---

# 9. Charts (OHLCV 차트)

## 엔드포인트

* `GET /charts/:symbol?range=1d|1w|1m|3m|6m|1y|max&interval=1m|5m|1h|1d`

  * 응답: 캔들 배열(시간, open, high, low, close, volume)

## 포함 기능

* 1일~최대 기간 그래프(캔들)
* 가격 그래프

---

# 10. Analytics (가격 위치/구간/변동성 등)

## 엔드포인트

* `GET /analytics/:symbol/price-position?window=1y`
* `GET /analytics/:symbol/price-bands?window=1y&bins=20`
* `GET /analytics/:symbol/returns?range=...`
* `GET /analytics/:symbol/volatility?range=...`

## 포함 기능

* 1년 최고/최저, 현재 위치, 평균가
* 가격 구간 분석
* 기간별 수익률 / 변동성 (애매한 “데이터 분석” 묶음)

---

# 11. Alerts (가격 알림 설정 CRUD)

## 엔드포인트

* `POST /alerts`

  * body 예: `{ symbol, type: 'target|rise|drop|band', payload: {...} }`
* `GET /alerts`
* `PATCH /alerts/:id`
* `DELETE /alerts/:id`

## 포함 기능

* 목표가/상승/하락/구간 알림
* 알림 수정/삭제/목록

---

# 12. Notifications (알림 기록/상태)

## 엔드포인트

* `GET /notifications` → 알림 기록 조회
* `PATCH /notifications/:id` → 읽음 처리 등
* (서버 내부) 재발송 제한/쿨다운 로직

## 포함 기능

* 푸시 알림(실제 발송은 서버 작업자)
* 알림 기록 조회
* 알림 재발송 제한
* 알림 상태 관리

---

# 13. Market (시장 요약/급등·급락·TOP)

## 엔드포인트

* `GET /market/summary?region=US|KR`
* `GET /market/movers?type=gainers|losers&limit=20`
* `GET /market/top?metric=change|volume&limit=20`

## 포함 기능

* 오늘 시장 요약
* 급등/급락 종목
* 변동률 TOP
* 거래량 급증 종목

---

# 14. News (종목 뉴스)

## 엔드포인트

* `GET /news?symbol=...&limit=20`
* `GET /news/latest?region=...`
* `GET /news/:id` (상세/링크)
* `POST /news/:id/summarize` (옵션: 서버 요약)

## 포함 기능

* 종목 관련 뉴스 조회
* 최신 뉴스
* 뉴스 요약
* 링크 이동(링크는 그대로 반환)

---

# 15. Stats (사용자 통계)

## 엔드포인트

* `GET /stats/me`

## 포함 기능

* 관심 종목 개수
* 알림 설정 개수
* 최근 확인 종목
* 알림 트리거 횟수

---

# 16. Home (홈 화면 통합 응답)

홈은 호출 수 줄이려고 **BFF 스타일**로 묶는 게 좋음.

## 엔드포인트

* `GET /home`

## 포함 기능(한 번에)

* 관심 종목 요약(+시세 벌크)
* 오늘 시장 요약
* 급등/급락
* 최근 확인 종목

---

# 17. Brokers (증권사/수수료/추천)

## 엔드포인트

* `GET /brokers`
* `GET /brokers/fees?symbol=...` (또는 `GET /brokers/:id/fees`)
* `PATCH /brokers/preferences` (유저의 선호/보유 계좌 여부 등)
* `GET /brokers/recommendation?symbol=...`
