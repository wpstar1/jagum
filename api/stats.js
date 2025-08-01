// Vercel API Route - 방문자 통계
export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // 현재 날짜
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // 임시 데이터 (실제로는 데이터베이스나 외부 저장소 사용)
        const mockStats = {
            [today]: {
                unique: Math.floor(Math.random() * 50) + 10,
                total: Math.floor(Math.random() * 100) + 20
            },
            [yesterday]: {
                unique: Math.floor(Math.random() * 45) + 8,
                total: Math.floor(Math.random() * 90) + 15
            }
        };

        res.status(200).json({
            today: mockStats[today],
            yesterday: mockStats[yesterday]
        });

    } catch (error) {
        console.error('통계 API 오류:', error);
        res.status(500).json({ 
            error: '통계 데이터를 불러올 수 없습니다.',
            today: { unique: 0, total: 0 },
            yesterday: { unique: 0, total: 0 }
        });
    }
}