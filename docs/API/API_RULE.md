### BE 스택

<aside>

BE 스택은 다음의 것을 사용하여 개발합니다.

- NestJS : 백엔드 API 처리 할 로직들을 담당합니다.
- supaDB (PostgreSQL )
: 메인 DB이며 유저 정보 등을 ( 추후예정 ) 영구적으로 관리하고 저장합니다.
- upstash
: 보조 DB 이며 ( 선택 사항 ) 서버의 속도를 높이기 위해 데이터 캐싱을 관리하며 가벼운 처리가 필요 할 때 사용합니다.
- AWS 
: 서버를 배포하고 호스팅하는데 사용됩니다.
</aside>

# API OverView

<aside>

## BaseURL

```
- API 요청은 다음 BaseURL으로 기재됩니다.
	https://ex.com

- API 예시는 swagger나 API 목록을 클릭하면 됩니다.

- Request 구조
	API 요청은 다음과 같은 방식으로 구성됩니다.
----------------------------------	
| 항목             | 설명           |
| --------------- | ------------- |
| Path Parameter  | URL 경로 변수   |
| Query Parameter | 조회 조건       |
| Request Body    | 데이터 생성 / 수정|
| Header          | 인증 정보       |
----------------------------------

자세한 것은 API 섹션을 참고하세요.

- Date / Time 포맷은 ISO 8601 UTC로 통일합니다.
	Ex) 2026-03-05T08:40:21Z
	
- 파일 업로드 규칙

- Content-Type: multipart/form-data
- 최대 파일 크기: 5MB
- 허용 확장자: .png, .jpg
- 추가 확장자는 추후 지원 예정
	
	
- CORS 허용 도메인

	dev (로컬 환경)
	- localhost:3000
	- 127.0.0.1:3000
	- 추후 에정

	prod (운영환경)
	- 추후예정
```

## API Rule

```
모든 API 는  다음의 규칙을 따릅니다.
- {BaseURL}/api/{resource}

- 예시 API
/api/auth
/api/users
/api/posts
/api/comments

- 예시 method
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PATCH  /api/users/{id}
DELETE /api/users/{id}
```

## Response 구조

<aside>

모든 응답에는 다음과 같은 규칙이 있습니다.

1. Response Format (공통 규칙)
2. Success Response
3. Error Response

### - Success Response

Success Response 는 다음의 구조를 가지고 있습니다.

| Field | Type | 설명 |
| --- | --- | --- |
| ok | boolean | 요청 성공 여부 |
| status | number | HTTP 상태 코드 |
| message | string | 요청 결과 메시지 |
| data | object | array | 응답 데이터 |
| meta | object | 추가 정보 (requestId, timestamp 등) |

### - Success Response Example

```json
{
  "ok": true,
  "status": 200,
  "message": "Request successful",
  "data": {},
  "meta": {
    "requestId": "req_01HQX8M3F",
    "timestamp": "2026-03-05T08:40:21Z"
  }
}
```

### -  Error Response

Error Response 는 다음의 구조를 가지고 있습니다.

| Field | Type | 설명 |
| --- | --- | --- |
| error.code | string | 에러 식별 코드 |
| error.message | string | 에러 설명 |
| error.detail | object  | 추가적인 에러 정보 |

### - Error Response Example

```json
{
  "ok": false,
  "status": 404,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "사용자를 찾을 수 없습니다",
    "detail": null
  },
  "meta": {
    "requestId": "req_01HQX8M3F",
    "timestamp": "2026-03-05T08:40:21Z"
  }
}
```

</aside>

</aside>

# Error Codes

<aside>

에러코드는 다음과 같이 구성됩니다.

## -Error Response

```json
{
  "ok": false,
  "status": 404,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "사용자를 찾을 수 없습니다",
    "detail": null
  },
  "meta": {
    "requestId": "req_01HQX8M3F",
    "timestamp": "2026-03-05T08:40:21Z"
  }
}
```

## Common Error Codes

공통적으로 사용되는 에러 코드입니다.

| Code | HTTP | 설명 |
| --- | --- | --- |
| INVALID_REQUEST | 400 | 잘못된 요청 |
| VALIDATION_ERROR | 400 | 요청 데이터 검증 실패 |
| UNAUTHORIZED | 401 | 인증 필요 |
| INVALID_TOKEN | 401 | 토큰이 유효하지 않음 |
| TOKEN_EXPIRED | 401 | 토큰 만료 |
| PERMISSION_DENIED | 403 | 권한 없음 |
| RESOURCE_NOT_FOUND | 404 | 리소스를 찾을 수 없음 |
| CONFLICT | 409 | 리소스 충돌 |
| RATE_LIMIT_EXCEEDED | 429 | 요청 제한 초과 |
| INTERNAL_SERVER_ERROR | 500 | 서버 내부 오류 |
</aside>

# API

<aside>

[User](https://www.notion.so/31aee832e9da80848955c541e47cb970?pvs=21)

## API

[향후 예정](https://www.notion.so/31aee832e9da805787c4f807eb2cb345?pvs=21)

</aside>