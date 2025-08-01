# 방문자 통계 시스템 사용법

## 구현된 기능
- 순수 방문자 수 추적 (중복 제거)
- 오늘 방문자 수 표시
- 어제 방문자 수 표시
- 실시간 자동 업데이트 (30초 간격)

## 파일 구성
1. **visitor-stats.php** - 방문자 통계 수집 및 API
2. **admin-stats.html** - 통계 확인 페이지
3. **visitor_stats.json** - 통계 데이터 저장 파일 (자동 생성)

## 사용 방법

### 1. PHP 서버 필요
이 시스템은 PHP가 필요합니다. 로컬에서 테스트하려면:
```bash
# PHP 내장 서버 실행
php -S localhost:8000
```

### 2. 통계 확인
브라우저에서 `admin-stats.html` 파일을 열면 방문자 통계를 확인할 수 있습니다.

### 3. Vercel 배포시 주의사항
Vercel은 정적 호스팅만 지원하므로 PHP를 사용할 수 없습니다. 
대안으로 다음을 고려하세요:
- Vercel Functions (Node.js)
- 외부 분석 서비스 (Google Analytics 등)
- 별도의 PHP 호스팅 서버

## 특징
- IP + 세션 기반으로 순수 방문자만 카운트
- 날짜별로 데이터 분리 저장
- 깔끔한 UI로 통계 확인 가능
- 30초마다 자동 새로고침

## 데이터 구조
```json
{
  "2025-08-01": {
    "unique_visitors": ["IP_세션ID", ...],
    "total_visits": 123
  }
}
```