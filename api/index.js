const app = require('../server.js');

module.exports = (req, res) => {
    const matched = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
    if (matched && matched.startsWith('/api')) {
        req.url = matched;
    } else if (req.url.startsWith('/public/api/')) {
        req.url = req.url.replace('/public/api/', '/api/');
    } else if (req.url.startsWith('/api/index.js')) {
        req.url = req.url.replace('/api/index.js', '/api');
    }
    return app(req, res);
};
