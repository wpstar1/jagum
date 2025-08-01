<?php
// 방문자 통계 처리 파일
session_start();

// 데이터 파일 경로
$stats_file = 'visitor_stats.json';

// 통계 데이터 불러오기
function load_stats() {
    global $stats_file;
    if (file_exists($stats_file)) {
        $data = json_decode(file_get_contents($stats_file), true);
        return $data ?: [];
    }
    return [];
}

// 통계 데이터 저장
function save_stats($stats) {
    global $stats_file;
    file_put_contents($stats_file, json_encode($stats, JSON_PRETTY_PRINT));
}

// 오늘 날짜
$today = date('Y-m-d');
$yesterday = date('Y-m-d', strtotime('-1 day'));

// 방문자 IP 및 세션 ID
$visitor_ip = $_SERVER['REMOTE_ADDR'];
$session_id = session_id();

// 통계 데이터 로드
$stats = load_stats();

// 오늘 날짜 데이터가 없으면 초기화
if (!isset($stats[$today])) {
    $stats[$today] = [
        'unique_visitors' => [],
        'total_visits' => 0
    ];
}

// 고유 방문자 체크 (IP + 세션 기반)
$visitor_key = $visitor_ip . '_' . $session_id;
if (!in_array($visitor_key, $stats[$today]['unique_visitors'])) {
    $stats[$today]['unique_visitors'][] = $visitor_key;
}

// 전체 방문 수 증가
$stats[$today]['total_visits']++;

// 통계 저장
save_stats($stats);

// API 엔드포인트로 사용할 경우
if (isset($_GET['action']) && $_GET['action'] === 'get_stats') {
    header('Content-Type: application/json');
    
    $today_unique = count($stats[$today]['unique_visitors']);
    $today_total = $stats[$today]['total_visits'];
    
    $yesterday_unique = 0;
    $yesterday_total = 0;
    
    if (isset($stats[$yesterday])) {
        $yesterday_unique = count($stats[$yesterday]['unique_visitors']);
        $yesterday_total = $stats[$yesterday]['total_visits'];
    }
    
    echo json_encode([
        'today' => [
            'unique' => $today_unique,
            'total' => $today_total
        ],
        'yesterday' => [
            'unique' => $yesterday_unique,
            'total' => $yesterday_total
        ]
    ]);
    exit;
}
?>