const PROXY_CONFIG = {
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/auth": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/barberos": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "bypass": function(req) {
      if (req.headers.accept && req.headers.accept.indexOf('html') !== -1) {
        return '/index.html';
      }
    }
  },
  "/productos": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "bypass": function(req) {
      if (req.headers.accept && req.headers.accept.indexOf('html') !== -1) {
        return '/index.html';
      }
    }
  },
  "/citas": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "bypass": function(req) {
      if (req.headers.accept && req.headers.accept.indexOf('html') !== -1) {
        return '/index.html';
      }
    }
  }
};

module.exports = PROXY_CONFIG;

