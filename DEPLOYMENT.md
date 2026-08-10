# OmniDownloader Pro - Production Deployment & Operations Guide

This guide provides instructions for deploying the **OmniDownloader Pro** backend service and building production Android release packages.

---

## 1. Backend Environment Setup

The backend service runs on **Node.js (v18+)** with Express and TypeScript.

### Environment Variables
Create a `.env` file inside the `server/` directory:

```env
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://app.omnidownloader.app
```

---

## 2. Backend Building & Deployment

### Build Command
Run from root directory:
```bash
npm run build:server
```
This compiles TypeScript files into `server/dist/`.

### Starting with PM2 (Recommended)
Install PM2 globally if not present:
```bash
npm install -g pm2
```
Start the service with PM2:
```bash
pm2 start server/dist/server.js --name "omnidownloader-backend"
pm2 save
pm2 startup
```

### Health Check Verification
Verify that the service is running correctly:
```bash
curl http://localhost:4000/api/health
```
**Expected Response:**
```json
{
  "status": "ok"
}
```

---

## 3. Reverse Proxy & HTTPS Configuration (Nginx)

Example Nginx server block with HTTPS reverse proxy:

```nginx
server {
    listen 443 ssl http2;
    server_name api.omnidownloader.app;

    ssl_certificate /etc/letsencrypt/live/api.omnidownloader.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.omnidownloader.app/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

---

## 4. Backend Rollback Procedure

If a deployed version experiences issues:

1. Stop the current process:
   ```bash
   pm2 stop omnidownloader-backend
   ```
2. Checkout previous git commit:
   ```bash
   git checkout <previous_stable_commit>
   ```
3. Rebuild and restart:
   ```bash
   npm run build:server
   pm2 restart omnidownloader-backend
   ```

---

## 5. Android Production Build & Versioning

### Environment Variable for Frontend Release
Set `VITE_API_URL` during Vite build:
```bash
VITE_API_URL=https://api.omnidownloader.app npm run build
```

### Android Signing Credentials (Capacitor/Gradle)
Store release keystore in local environment variables (never in git):
```bash
export RELEASE_KEYSTORE_PATH=/path/to/release.keystore
export RELEASE_KEYSTORE_PASSWORD=your_keystore_password
export RELEASE_KEY_ALIAS=your_key_alias
export RELEASE_KEY_PASSWORD=your_key_password
```

### Version Code Strategy
- Version Name: `1.0.0`
- Version Code: `100` (Increment by 1 for each production release: 101, 102, 103...)
