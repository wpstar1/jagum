// 방문자 추적 API
import { MongoClient } from 'mongodb';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('jagum_stats');
        const collection = db.collection('visitors');

        // 방문자 정보
        const today = new Date().toISOString().split('T')[0];
        const visitorIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || '';
        const referer = req.headers.referer || '';

        // 고유 방문자 식별 (IP + User Agent의 해시)
        const visitorHash = Buffer.from(visitorIP + userAgent).toString('base64').slice(0, 10);

        // 오늘 이미 방문한 사용자인지 확인
        const existingVisit = await collection.findOne({
            date: today,
            visitorHash: visitorHash
        });

        if (!existingVisit) {
            // 새로운 방문자 기록
            await collection.insertOne({
                date: today,
                visitorHash: visitorHash,
                ip: visitorIP,
                userAgent: userAgent,
                referer: referer,
                timestamp: new Date(),
                visitCount: 1
            });
        } else {
            // 기존 사용자의 재방문 카운트 증가
            await collection.updateOne(
                {
                    date: today,
                    visitorHash: visitorHash
                },
                {
                    $inc: { visitCount: 1 },
                    $set: { lastVisit: new Date() }
                }
            );
        }

        res.status(200).json({ 
            success: true, 
            message: 'Visit tracked successfully',
            isNewVisitor: !existingVisit
        });

    } catch (error) {
        console.error('방문자 추적 오류:', error);
        res.status(500).json({ 
            error: '방문자 추적에 실패했습니다.',
            success: false
        });
    }
}