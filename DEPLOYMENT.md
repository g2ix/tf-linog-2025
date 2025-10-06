# Deployment Guide

This guide covers different deployment options for the Earthquake Cebu application.

## 🚀 Deployment Options

### Option 1: Traditional VPS/Server Deployment

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 16+
- MySQL 8.0+
- Nginx (optional, for reverse proxy)

#### Steps

1. **Clone and setup the application**
   ```bash
   git clone <your-repo-url>
   cd earthquake-cebu
   npm run install-all
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your production values
   ```

3. **Setup MySQL database**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. **Build and start**
   ```bash
   npm run build
   npm start
   ```

5. **Setup PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name "earthquake-cebu"
   pm2 startup
   pm2 save
   ```

### Option 2: Cloud Platform Deployment

#### Heroku

1. **Create Heroku app**
   ```bash
   heroku create earthquake-cebu-app
   ```

2. **Add MySQL addon**
   ```bash
   heroku addons:create cleardb:ignite
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set GOOGLE_MAPS_API_KEY=your_api_key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### DigitalOcean App Platform

1. **Connect your GitHub repository**
2. **Configure environment variables**
3. **Set build command**: `npm run build`
4. **Set run command**: `npm start`

#### AWS EC2

1. **Launch EC2 instance**
2. **Install Node.js and MySQL**
3. **Follow traditional VPS deployment steps**
4. **Configure security groups for ports 80, 443, 22**

#### Vercel (Frontend) + Railway/Render (Backend)

1. **Deploy backend to Railway or Render**
2. **Deploy frontend to Vercel**
3. **Configure environment variables**
4. **Set up database connection**

## 🔧 Production Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=earthquake_cebu

# Server
NODE_ENV=production
PORT=5000

# Security
JWT_SECRET=your_super_secure_jwt_secret_key

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Image hosting
GITHUB_REPO=username/earthquake-images

# Admin credentials (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
```

### Database Setup

1. **Create database**
   ```sql
   CREATE DATABASE earthquake_cebu;
   ```

2. **Import schema**
   ```bash
   mysql -u root -p earthquake_cebu < database/schema.sql
   ```

3. **Create admin user** (if not using default)
   ```sql
   INSERT INTO admin (username, password_hash) VALUES 
   ('your_admin', '$2b$10$your_hashed_password');
   ```

### Nginx Configuration (Optional)

Create `/etc/nginx/sites-available/earthquake-cebu`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/earthquake-cebu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:
- `GET /api/updates` - Basic health check
- `GET /api/markers` - Database connectivity

### Log Management

1. **PM2 logs**
   ```bash
   pm2 logs earthquake-cebu
   ```

2. **Application logs**
   ```bash
   tail -f /var/log/earthquake-cebu/app.log
   ```

### Database Backups

```bash
# Create backup
mysqldump -u root -p earthquake_cebu > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
mysql -u root -p earthquake_cebu < backup_file.sql
```

### Updates and Maintenance

1. **Update application**
   ```bash
   git pull origin main
   npm run build
   pm2 restart earthquake-cebu
   ```

2. **Update dependencies**
   ```bash
   npm update
   npm run build
   pm2 restart earthquake-cebu
   ```

## 🔒 Security Considerations

1. **Change default admin credentials**
2. **Use strong JWT secrets**
3. **Enable HTTPS in production**
4. **Regular security updates**
5. **Database access restrictions**
6. **Firewall configuration**

## 📱 Performance Optimization

1. **Enable gzip compression**
2. **Use CDN for static assets**
3. **Database indexing**
4. **Caching strategies**
5. **Image optimization**

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check database credentials
   - Verify MySQL is running
   - Check firewall settings

2. **Google Maps not loading**
   - Verify API key
   - Check domain restrictions
   - Ensure API is enabled

3. **Images not loading**
   - Verify GitHub repository is public
   - Check jsDelivr URL format
   - Verify image paths

4. **Admin login issues**
   - Check JWT secret
   - Verify admin credentials
   - Check database connection

### Debug Mode

Set `NODE_ENV=development` for detailed error messages.

## 📞 Support

For deployment issues:
1. Check the logs
2. Verify environment variables
3. Test database connectivity
4. Check API keys and permissions

---

**Note**: Always test your deployment in a staging environment before going live with production data.
