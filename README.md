# Inventory Management System

A comprehensive fullstack inventory management system built with Java Spring Boot backend and React.js frontend. This system helps small to medium businesses manage their products, suppliers, inventory transactions, and generate reports.

## 🚀 Features

### Core Features
- **Product Management (CRUD)**: Add, edit, delete, and view products with categories, pricing, and stock levels
- **Supplier Management (CRUD)**: Manage supplier information and relationships
- **Inventory Transactions**: Track stock in/out movements with detailed history
- **Stock Reporting**: Real-time stock levels, low stock alerts, and inventory valuation
- **Transaction Reports**: Daily, weekly, and monthly transaction summaries
- **Dashboard**: Overview with key metrics and recent activities

### Security & User Management
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and Staff roles with different permissions
- **User Management**: Admin can create and manage user accounts

### Technical Features
- **RESTful API**: Well-documented API with Swagger/OpenAPI
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Real-time Updates**: Dynamic dashboard with live data
- **Docker Support**: Easy deployment with Docker Compose
- **Database**: PostgreSQL with JPA/Hibernate ORM

## 🛠 Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.5.6**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA** (Database ORM)
- **PostgreSQL** (Database)
- **Swagger/OpenAPI** (API Documentation)
- **Maven** (Dependency Management)

### Frontend
- **React 19** with TypeScript
- **React Router** (Navigation)
- **Tailwind CSS** (Styling)
- **Axios** (HTTP Client)
- **React Hook Form** (Form Management)
- **Recharts** (Charts and Analytics)
- **Heroicons** (Icons)

### DevOps
- **Docker & Docker Compose**
- **PostgreSQL** (Containerized Database)

### Quick navigation
- [Project structure](PROJECT_STRUCTURE.md)
- [Deployment](DEPLOYMENT.md)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Java 17** or higher
- **Node.js 18** or higher
- **Docker & Docker Compose**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/badruzbby/inventory-management.git
cd inventory-management
```

### 2. Environment Setup

#### Backend Configuration
The backend uses `application.yml` for configuration. Default settings work with Docker Compose.

#### Frontend Configuration
Create environment file for frontend:

```bash
cd frontend
cp env.example .env.local
```

Edit `.env.local`:
```
VITE_API_URL=http://localhost:8080/api
```

### 3. Run with Docker Compose (Recommended)

This is the easiest way to run the entire application:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will start:
- PostgreSQL database on port 5432
- Spring Boot backend on port 8080
- Frontend dev server on port 5173 (if you run it separately)

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html

### 5. Default Login Credentials

```
Admin User:
- Username: admin
- Password: admin123

Staff User:
- Username: staff
- Password: staff123
```

## 🔧 Development Setup

### Backend Development

```bash
cd backend

# Run with Maven
./mvnw spring-boot:run

# Or build and run JAR
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Database Setup

If running without Docker:

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE inventory_management;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE inventory_management TO postgres;
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user info

### Core API Endpoints
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier (Admin only)

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/product/{id}` - Get product transactions

- `GET /api/reports/stock` - Get stock report
- `GET /api/reports/summary` - Get transaction summary

### API Documentation
Full API documentation is available at: http://localhost:8080/api/swagger-ui.html

## 🐳 Docker Deployment

### Production Docker Setup

1. **Build Production Images**:
```bash
# Build backend
cd backend
docker build -t inventory-backend .

# Build frontend (you'll need a production Dockerfile)
cd frontend
npm run build
```

2. **Environment Variables for Production**:
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    # ... postgres config
  
  backend:
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/inventory_management
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      JWT_SECRET: your-production-secret-key-here
      JWT_EXPIRATION: 86400000
```

### Cloud Deployment Options

#### Backend Deployment (Heroku/Render)

1. **Heroku**:
```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Deploy
git subtree push --prefix backend heroku main
```

2. **Render**:
- Connect your GitHub repository
- Set build command: `cd backend && ./mvnw clean package`
- Set start command: `java -jar backend/target/backend-0.0.1-SNAPSHOT.jar`
- Add PostgreSQL database service

#### Frontend Deployment (Vercel/Netlify)

1. **Vercel**:
```bash
cd frontend
npm install -g vercel
vercel --prod
```

2. **Netlify**:
- Connect GitHub repository
- Set build directory: `frontend`
- Set build command: `npm run build`
- Set publish directory: `frontend/dist`

## 🧪 Testing

### Backend Testing
```bash
cd backend
./mvnw test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

### API Testing with Postman
Import the API collection from the Swagger documentation or create requests for:
- Authentication flow
- CRUD operations for all entities
- Report generation

## 📊 Database Schema

### Core Tables
- `users` - User accounts and roles
- `suppliers` - Supplier information
- `products` - Product catalog with pricing and stock
- `transactions` - Inventory movements (in/out)

### Key Relationships
- Products belong to Suppliers (Many-to-One)
- Transactions reference Products and Users (Many-to-One)
- Users can have multiple Transactions (One-to-Many)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with configurable expiration
- **Role-based Authorization**: Admin and Staff roles with different permissions
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Configurable cross-origin resource sharing
- **SQL Injection Protection**: JPA/Hibernate parameterized queries

## 🚀 Performance Optimizations

- **Database Indexing**: Proper indexes on frequently queried fields
- **Lazy Loading**: JPA lazy loading for better performance
- **Connection Pooling**: HikariCP connection pooling
- **Frontend Code Splitting**: React lazy loading for components

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Ensure PostgreSQL is running
   - Check connection strings and credentials
   - Verify network connectivity in Docker

2. **JWT Token Issues**:
   - Check JWT secret configuration
   - Verify token expiration settings
   - Clear browser localStorage

3. **CORS Errors**:
   - Update CORS configuration in SecurityConfig
   - Check frontend API URL configuration

4. **Docker Build Failures**:
   - Clean Docker cache: `docker system prune`
   - Check Dockerfile paths and permissions

### Logs and Debugging

```bash
# View application logs
docker-compose logs backend
docker-compose logs postgres

# Backend debug mode
export SPRING_PROFILES_ACTIVE=debug

# Frontend debug
npm run dev -- --debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend**: Java Spring Boot with PostgreSQL
- **Frontend**: React.js with TypeScript and Tailwind CSS
- **DevOps**: Docker containerization

## 🔮 Future Enhancements

- [ ] Multi-warehouse support
- [ ] Barcode scanning integration
- [ ] Email notifications for low stock
- [ ] Advanced reporting with charts
- [ ] Export reports to Excel/PDF
- [ ] Mobile app support
- [ ] Audit trail for all changes
- [ ] Backup and restore functionality

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/swagger-ui.html`
- Review the troubleshooting section above

---

**Built with ❤️ using Spring Boot and React.js**
