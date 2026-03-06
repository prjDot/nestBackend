# CAP3 Backend - 주식 분석 API

## Stack
- NestJS 11
- PostgreSQL + Prisma
- Google/Kakao OAuth
- Swagger (API 문서)

## API
- **Instruments**: 종목 검색, 자동완성, 마스터 정보
- **Quotes**: 시세 조회 (단일/배치)
- **Analytics**: 52주 구간 내 가격 위치 분석
- **Auth**: Google/Kakao OAuth, Bearer 토큰
- **Users**: 사용자 정보
- **SearchHistory**: 검색 이력 관리
- **Watchlist, Alerts, Notifications**: 추가 기능

## Docs
```
localhost:8080/api/docs - Swagger UI
localhost:8080/api/docs-json - OpenAPI JSON
```
