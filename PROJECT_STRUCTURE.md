# Project Structure

```
inventory-management/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/inventory/management/backend/
│   │   ├── BackendApplication.java   # Main Spring Boot Application
│   │   ├── component/
│   │   │   └── DataInitializer.java  # Database initialization
│   │   ├── config/
│   │   │   ├── ApplicationConfig.java # General app configuration
│   │   │   ├── OpenApiConfig.java    # Swagger/OpenAPI configuration
│   │   │   └── SecurityConfig.java   # Spring Security configuration
│   │   ├── controller/               # REST Controllers
│   │   │   ├── AuthController.java   # Authentication endpoints
│   │   │   ├── ProductController.java
│   │   │   ├── SupplierController.java
│   │   │   ├── TransactionController.java
│   │   │   ├── UserController.java
│   │   │   └── ReportController.java
│   │   ├── dto/                      # Data Transfer Objects
│   │   │   ├── JwtResponse.java
│   │   │   ├── LoginRequest.java
│   │   │   ├── ProductDto.java
│   │   │   ├── SupplierDto.java
│   │   │   ├── TransactionDto.java
│   │   │   ├── UserDto.java
│   │   │   ├── StockReportDto.java
│   │   │   └── TransactionSummaryDto.java
│   │   ├── entity/                   # JPA Entities
│   │   │   ├── User.java
│   │   │   ├── Supplier.java
│   │   │   ├── Product.java
│   │   │   └── Transaction.java
│   │   ├── repository/               # JPA Repositories
│   │   │   ├── UserRepository.java
│   │   │   ├── SupplierRepository.java
│   │   │   ├── ProductRepository.java
│   │   │   └── TransactionRepository.java
│   │   ├── security/                 # Security Components
│   │   │   ├── JwtUtils.java
│   │   │   ├── UserPrincipal.java
│   │   │   ├── CustomUserDetailsService.java
│   │   │   ├── AuthTokenFilter.java
│   │   │   └── AuthEntryPointJwt.java
│   │   └── service/                  # Business Logic
│   │       ├── UserService.java
│   │       ├── SupplierService.java
│   │       ├── ProductService.java
│   │       └── TransactionService.java
│   ├── src/main/resources/
│   │   └── application.yml           # Application configuration
│   ├── Dockerfile                    # Docker configuration for backend
│   ├── .dockerignore
│   ├── pom.xml                       # Maven dependencies
│   └── mvnw, mvnw.cmd               # Maven wrapper
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── Login.tsx         # Login component
│   │   │   ├── common/
│   │   │   │   └── ProtectedRoute.tsx # Route protection
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.tsx     # Main dashboard
│   │   │   ├── layout/
│   │   │   │   └── Layout.tsx        # Main layout with sidebar
│   │   │   ├── products/
│   │   │   │   └── Products.tsx      # Product management
│   │   │   ├── suppliers/
│   │   │   │   └── Suppliers.tsx     # Supplier management
│   │   │   ├── transactions/
│   │   │   │   └── Transactions.tsx  # Transaction management
│   │   │   ├── reports/
│   │   │   │   └── Reports.tsx       # Reports and analytics
│   │   │   └── users/
│   │   │       └── Users.tsx         # User management (Admin only)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # Authentication context
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript type definitions
│   │   ├── utils/
│   │   │   └── api.ts                # API client and endpoints
│   │   ├── App.tsx                   # Main App component
│   │   ├── main.tsx                  # React entry point
│   │   └── index.css                 # Tailwind CSS styles
│   ├── public/                       # Static assets
│   ├── package.json                  # NPM dependencies
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── vite.config.ts                # Vite configuration
│   └── env.example                   # Environment variables example
│
├── docker-compose.yml                # Docker Compose configuration
├── init.sql                          # Database initialization script
├── start-dev.sh                      # Development startup script
├── start-prod.sh                     # Production startup script
├── README.md                         # Main documentation
└── PROJECT_STRUCTURE.md              # This file
```

## Key Components

### Backend Architecture
- **Layered Architecture**: Controller → Service → Repository → Entity
- **Security**: JWT-based authentication with role-based authorization
- **Database**: PostgreSQL with JPA/Hibernate ORM
- **API Documentation**: Swagger/OpenAPI integration
- **Configuration**: YAML-based configuration management

### Frontend Architecture
- **Component Structure**: Feature-based organization
- **State Management**: React Context for authentication
- **Routing**: React Router with protected routes
- **Styling**: Tailwind CSS with custom components
- **API Integration**: Axios with interceptors for authentication

### Database Schema
- **users**: User accounts and authentication
- **suppliers**: Supplier information and contacts
- **products**: Product catalog with pricing and inventory
- **transactions**: Inventory movements and history

### Security Features
- JWT token-based authentication
- Role-based access control (Admin/Staff)
- Password encryption with BCrypt
- CORS configuration for cross-origin requests
- Protected API endpoints with Spring Security

### Development Tools
- Docker Compose for local development
- Hot reloading for both frontend and backend
- Swagger UI for API testing
- TypeScript for type safety
- ESLint for code quality

This structure follows industry best practices for fullstack applications with clear separation of concerns, maintainable code organization, and scalable architecture.
