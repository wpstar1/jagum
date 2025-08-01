// MongoDB 연결 테스트 API
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const results = {
        timestamp: new Date().toISOString(),
        mongodb_uri_exists: !!process.env.MONGODB_URI,
        mongodb_uri_preview: process.env.MONGODB_URI ? 
            process.env.MONGODB_URI.substring(0, 20) + '...' : 'Not set',
        connection_status: 'testing...',
        database_accessible: false,
        collection_accessible: false,
        error: null
    };

    try {
        // MongoDB 연결 테스트
        const client = new MongoClient(process.env.MONGODB_URI);
        
        // 연결 시도 (10초 타임아웃)
        await client.connect();
        results.connection_status = 'connected';

        // 데이터베이스 접근 테스트
        const db = client.db('jagum_stats');
        await db.admin().ping();
        results.database_accessible = true;

        // 컬렉션 접근 테스트
        const collection = db.collection('visitors');
        const count = await collection.countDocuments();
        results.collection_accessible = true;
        results.total_records = count;

        // 오늘 방문자 수 확인
        const today = new Date().toISOString().split('T')[0];
        const todayCount = await collection.countDocuments({ date: today });
        results.today_visitors = todayCount;

        await client.close();

        res.status(200).json({
            success: true,
            message: 'MongoDB 연결 성공!',
            details: results
        });

    } catch (error) {
        results.connection_status = 'failed';
        results.error = error.message;

        console.error('MongoDB 연결 실패:', error);
        
        res.status(500).json({
            success: false,
            message: 'MongoDB 연결 실패',
            details: results
        });
    }
}