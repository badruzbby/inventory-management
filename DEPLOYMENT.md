# Deployment Guide

This guide covers different deployment options for the Inventory Management System.

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/badruzbby/inventory-management
cd inventory-management

# Make scripts executable
chmod +x start-dev.sh start-prod.sh

# Start development environment
./start-dev.sh
```

## 🐳 Docker Deployment

### Local Production with Docker

```bash
# Start all services in production mode
./start-prod.sh

# Or manually with docker-compose
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Compose Services
- **PostgreSQL**: Database on port 5432
- **Spring Boot Backend**: API server on port 8080
- **Frontend**: Serve static files (for production build)

## ☁️ Cloud Deployment

### Backend Deployment Options

#### 1. Heroku Deployment

```bash
# Install Heroku CLI
# Create Heroku app
heroku create inventory-backend-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your-production-secret-key-here
heroku config:set JWT_EXPIRATION=86400000
heroku config:set SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Deploy backend (from project root)
git subtree push --prefix backend heroku main

# Or create separate repo for backend
cd backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a inventory-backend-app
git push heroku main
```

**Heroku Environment Variables:**
```
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRATION=86400000
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

#### 2. Render Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && ./mvnw clean package`
4. Set start command: `java -jar backend/target/backend-0.0.1-SNAPSHOT.jar`
5. Add environment variables:
   ```
   JWT_SECRET=your-secret-key
   JWT_EXPIRATION=86400000
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   ```
6. Create PostgreSQL database service and connect

#### 3. Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway project new
railway add postgresql
railway deploy
```

### Frontend Deployment Options

#### 1. Vercel Deployment

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Create .env.local with production API URL
echo "VITE_API_URL=https://your-backend-url.herokuapp.com/api" > .env.local

# Deploy
vercel --prod
```

**Vercel Environment Variables:**
```
VITE_API_URL=https://your-backend-url.com/api
```

#### 2. Netlify Deployment

1. Connect GitHub repository to Netlify
2. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

#### 3. Static File Hosting

```bash
cd frontend

# Build for production
npm run build

# Upload dist/ folder to any static hosting service:
# - AWS S3 + CloudFront
# - Google Cloud Storage
# - Azure Static Web Apps
# - GitHub Pages
```

## 🔧 Production Configuration

### Backend Production Settings

Create `application-prod.yml`:
```yaml
server:
  port: ${PORT:8080}

spring:
  datasource:
    url: ${DATABASE_URL}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  
jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:86400000}

logging:
  level:
    com.inventory.management: INFO
    org.springframework.security: WARN
```

### Environment Variables

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=jdbc:postgresql://host:port/database
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRATION=86400000

# Optional
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
```

### Frontend Production Build

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# The dist/ folder contains production-ready files
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use strong JWT secret (min 32 characters)
- [ ] Set appropriate JWT expiration time
- [ ] Use HTTPS in production
- [ ] Configure CORS for specific domains
- [ ] Use environment variables for secrets
- [ ] Enable database SSL connections
- [ ] Set up proper firewall rules
- [ ] Regular security updates

### CORS Configuration

Update `SecurityConfig.java` for production:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "https://your-frontend-domain.com",
        "http://localhost:3000" // for development
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## 📊 Monitoring and Maintenance

### Health Checks

The backend includes Spring Boot Actuator endpoints:
```
GET /actuator/health
GET /actuator/info
```

### Database Migrations

For production updates:
1. Set `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`
2. Use Flyway or Liquibase for database migrations
3. Backup database before updates

### Logging

Configure logging for production:
```yaml
logging:
  level:
    com.inventory.management: INFO
  file:
    name: /var/log/inventory-management.log
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Java
        uses: actions/setup-java@v2
        with:
          java-version: '17'
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

## 🆘 Troubleshooting

### Common Production Issues

1. **Database Connection Issues**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Check SSL requirements

2. **CORS Errors**
   - Update allowed origins in SecurityConfig
   - Check frontend API URL configuration

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure consistent secret across instances

4. **Build Failures**
   - Check Java/Node versions
   - Verify all dependencies are available
   - Check memory limits in deployment platform

### Logs and Monitoring

```bash
# Heroku logs
heroku logs --tail -a your-app-name

# Docker logs
docker-compose logs -f backend

# Application logs
tail -f /var/log/inventory-management.log
```

## 📈 Scaling Considerations

### Database Scaling
- Use connection pooling (HikariCP is included)
- Consider read replicas for reporting
- Implement database indexing

### Application Scaling
- Use horizontal scaling with load balancers
- Implement caching (Redis)
- Consider microservices architecture for large scale

### Frontend Optimization
- Use CDN for static assets
- Implement code splitting
- Enable gzip compression
- Use service workers for caching

---

This deployment guide provides multiple options for hosting your Inventory Management System. Choose the option that best fits your requirements and budget.
