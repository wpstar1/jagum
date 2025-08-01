// robots.txt API route
export default function handler(req, res) {
    const robotsTxt = `User-agent: *
Allow: /

# 사이트맵 위치
Sitemap: https://jagum.vercel.app/sitemap.xml

# 통계 페이지는 검색엔진에서 제외
Disallow: /admin-stats.html
Disallow: /api/`;

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(robotsTxt);
}