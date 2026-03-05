# CAP3 Backend

## Stack

- **Framework**: NestJS 10.4.16
- **Cache**: Redis (ioredis)
- **API Documentation**: Swagger: http://localhost:3000/api/docs

## Features

### Stock Analyzer
- 단일 종목 조회: `GET /api/stocks/{symbol}`
- 다중 종목 조회: `GET /api/stocks?symbols=AAPL,005930,카카오`
- 52주 기준 위치(%) 분석
- Mock 데이터 (30개 종목: US 15개 + KR 15개)
- Redis 캐싱 (TTL: 60초) -- 나중에 추가

## Setup

### Install Dependencies
```bash
pnpm install
```

### Required Environment Variables
- `REDIS_URL`

### Build
```bash
pnpm run build
```

### Run
```bash
# Development (watch mode)
pnpm run start:dev

# Production
pnpm run start

# Lint
pnpm run lint

# Format
pnpm run format
```

## Roadmap

- [ ] Redis 실제 연동 (캐싱)
- [ ] 알림 기능 (24시간 중복 방지)
- [ ] 위시리스트 기능
- [ ] 사용자 인증 시스템
- [ ] Supabase PostgreSQL 통합
- [ ] 히스토리 및 차트 데이터

## Development

### Supported Stock Markets
- **US**: AAPL, TSLA, AMZN, NVDA, MSFT, GOOGL, META, NFLX, AMD, INTC, QCOM, BA, DIS, UBER, COIN
- **KR**: 삼성전자(005930), SK하이닉스(000660), LG에너지솔루션(373220), 네이버(035420), 카카오(035720) 등

### Search by
- 티커: AAPL, TSLA
- 종목코드: 005930, 035720
- 종목명 (한글): 삼성전자, 카카오
