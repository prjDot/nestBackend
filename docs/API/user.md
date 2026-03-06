# User API


user API는 다음과 같이 구성이 됩니다.
```
### default

- Login
- Logout
- Signup
- Settgins
- Notification


### User Management
- Nickname Change
- Profile Image Change
- Account Sync State

```

# Data Schema

```
User

├── uid // Google 고유 ID
├── email // 이메일
├── displayName // 닉네임
├── photoURL // 프로필 이미지 URL
├── createdAt // 가입일
├── lastLoginAt // 마지막 로그인
└── notificationEnabled // 알림 권한 여부 → TODO
```