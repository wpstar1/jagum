// Vercel API Route - 실제 방문자 통계 (MongoDB)
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('jagum_stats');
        const collection = db.collection('visitors');

        // 현재 날짜
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // 오늘 통계
        const todayStats = await collection.aggregate([
            { $match: { date: today } },
            {
                $group: {
                    _id: null,
                    unique: { $sum: 1 },
                    total: { $sum: '$visitCount' }
                }
            }
        ]).toArray();

        // 어제 통계
        const yesterdayStats = await collection.aggregate([
            { $match: { date: yesterday } },
            {
                $group: {
                    _id: null,
                    unique: { $sum: 1 },
                    total: { $sum: '$visitCount' }
                }
            }
        ]).toArray();

        const todayData = todayStats[0] || { unique: 0, total: 0 };
        const yesterdayData = yesterdayStats[0] || { unique: 0, total: 0 };

        res.status(200).json({
            today: {
                unique: todayData.unique,
                total: todayData.total
            },
            yesterday: {
                unique: yesterdayData.unique,
                total: yesterdayData.total
            }
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