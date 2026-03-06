# New_API TODO (기준: `docs/API/New_API.md`)

## 기준/충돌 정리
- 기준 문서: `New_API.md`
- 충돌 시 처리:
  - `overView.md`의 도메인 모델/제약은 반영
  - 외부 시세/뉴스/시장 데이터 의존 API는 제외 (한국투자증권 API 연동 예정)

## 이번 반영 (완료)
- [x] Auth
  - [x] `GET /api/auth/google`
  - [x] `GET /api/auth/google/callback`
  - [x] `GET /api/auth/kakao`
  - [x] `GET /api/auth/kakao/callback`
  - [x] `POST /api/auth/logout`
  - [x] `DELETE /api/auth/account`
  - [x] OAuth 콜백 응답에 내부 Bearer 토큰 발급 추가

- [x] Users
  - [x] `GET /api/users/me`
  - [x] `PATCH /api/users/me`
  - [x] theme/notificationEnabled 저장 필드 반영

- [x] Devices
  - [x] `POST /api/devices`
  - [x] `PATCH /api/devices/:deviceId`
  - [x] `DELETE /api/devices/:deviceId`

- [x] Search History
  - [x] `GET /api/search/history`
  - [x] `POST /api/search/history`
  - [x] `DELETE /api/search/history/:id`
  - [x] `DELETE /api/search/history`
  - [x] 최근 10개 유지 정책 반영

- [x] Watchlist
  - [x] `POST /api/watchlist`
  - [x] `GET /api/watchlist`
  - [x] `DELETE /api/watchlist/:symbol`
  - [x] 사용자별 max 50 제약 반영
  - [x] `sort=price|change`는 외부 시세 의존으로 현재 400 처리

- [x] Alerts
  - [x] `POST /api/alerts`
  - [x] `GET /api/alerts`
  - [x] `PATCH /api/alerts/:id`
  - [x] `DELETE /api/alerts/:id`
  - [x] 타입별 파라미터 검증 반영 (`target|rise|fall|range`)

- [x] Notifications
  - [x] `GET /api/notifications`
  - [x] `PATCH /api/notifications/:id`

- [x] Stats
  - [x] `GET /api/stats/me`

- [x] 운영성/헬스
  - [x] `GET /api/health/ready` (DB readiness)

## 보류 (한국투자증권 API 연동 이후)
- [ ] Instruments
  - [ ] `GET /api/instruments/search`
  - [ ] `GET /api/instruments/autocomplete`
  - [ ] `GET /api/instruments/popular`
  - [ ] `GET /api/instruments/:symbol`

- [ ] Quotes
  - [ ] `GET /api/quotes/:symbol`
  - [ ] `GET /api/quotes?symbols=...`

- [ ] Fundamentals
  - [ ] `GET /api/fundamentals/:symbol`

- [ ] Charts
  - [ ] `GET /api/charts/:symbol`

- [ ] Analytics
  - [ ] `GET /api/analytics/:symbol/*`

- [ ] Market
  - [ ] `GET /api/market/summary`
  - [ ] `GET /api/market/movers`
  - [ ] `GET /api/market/top` 또는 `volume-spike`

- [ ] News
  - [ ] `GET /api/news`
  - [ ] `GET /api/news/latest`
  - [ ] `GET /api/news/:id`
  - [ ] `POST /api/news/:id/summarize`

- [ ] Home (BFF)
  - [ ] `GET /api/home`

- [ ] Brokers
  - [ ] `GET /api/brokers`
  - [ ] `GET /api/brokers/fees|compare`
  - [ ] `PATCH /api/brokers/preferences`
  - [ ] `GET /api/brokers/recommendation`

## 메모
- 현재 API는 공통 응답 규격(`ok/status/message/data/meta`) 유지.
- 인증은 내부 Bearer 토큰(소셜 로그인 콜백에서 발급) 기반으로 보호됨.
