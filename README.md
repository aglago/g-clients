# ProjectOne - Learning Management System

A comprehensive full-stack learning management system built with modern web technologies, designed to facilitate professional learning and development through courses, tracks, and structured learning paths.

## 🚀 Project Overview

ProjectOne is a sophisticated learning management system that enables administrators to manage courses, tracks, and learner progress while providing learners with a seamless learning experience. The platform features a robust authentication system, course management, progress tracking, and comprehensive administrative tools.

### Key Features

- **👥 User Management**: Separate admin and learner authentication systems
- **📚 Course Management**: Create, update, and manage learning courses
- **🎯 Learning Tracks**: Organize courses into structured learning paths
- **📈 Progress Tracking**: Monitor learner progress and completion rates
- **💳 Invoice Management**: Handle payments and billing
- **📧 Email Notifications**: Automated email system for verification and notifications
- **🔐 Secure Authentication**: JWT-based authentication with OTP verification
- **🎨 Modern UI**: Clean, responsive interface built with Tailwind CSS
- **📱 Mobile-Responsive**: Optimized for all device sizes

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Notifications**: Sonner (Toast notifications)

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer (Gmail SMTP)
- **Environment**: Environment variables for configuration

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Code Style**: Prettier (via ESLint)
- **Version Control**: Git

## 📋 Libraries and Dependencies

### Core Dependencies
```json
{
  "next": "15.3.5",
  "react": "19.0.0",
  "typescript": "5.0.0",
  "tailwindcss": "3.4.1",
  "mongoose": "^8.0.0",
  "bcryptjs": "^2.4.3",
  "nodemailer": "^6.9.0",
  "axios": "^1.6.0",
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^5.0.0",
  "sonner": "^1.3.0"
}
```

### UI and Styling
- **@radix-ui/react-***: Accessible UI primitives
- **class-variance-authority**: For component variants
- **clsx**: For conditional class names
- **tailwind-merge**: For merging Tailwind classes
- **lucide-react**: Modern icon library

## 🏗️ Architecture Decisions

### Why Next.js 15?
- **Full-Stack Capability**: Combines frontend and backend in one framework
- **App Router**: Modern routing with server components
- **API Routes**: Built-in API endpoint creation
- **Performance**: Automatic optimization and caching
- **Type Safety**: Excellent TypeScript integration

### Why MongoDB?
- **Flexibility**: Schema-less design for evolving data structures
- **Scalability**: Horizontal scaling capabilities
- **Performance**: Fast queries and indexing
- **JSON-Native**: Perfect match for JavaScript/TypeScript applications
- **Mongoose ODM**: Provides schema validation and middleware

### Why Zustand over Redux?
- **Simplicity**: Less boilerplate and easier setup
- **Performance**: Minimal re-renders and efficient updates
- **TypeScript**: Excellent TypeScript support
- **Bundle Size**: Smaller footprint than Redux
- **Developer Experience**: Intuitive API and debugging

### Why TanStack Query?
- **Server State**: Specialized for server state management
- **Caching**: Intelligent caching and background updates
- **Performance**: Optimistic updates and pagination
- **Developer Tools**: Excellent debugging capabilities
- **Integration**: Works seamlessly with our API structure

### Why Shadcn/ui?
- **Accessibility**: Built on Radix UI primitives
- **Customization**: Copy-paste components for full control
- **Consistency**: Unified design system
- **Modern**: Latest React patterns and best practices
- **TypeScript**: Full TypeScript support

### Why JWT Authentication?
- **Stateless**: No server-side session storage needed
- **Scalable**: Works across distributed systems
- **Secure**: Cryptographically signed tokens
- **Flexible**: Can carry user information and permissions
- **Standard**: Industry-standard authentication method

### Why OTP Email Verification?
- **Security**: More secure than long-lived tokens
- **User Experience**: Familiar verification method
- **Time-Limited**: Automatic expiration reduces risk
- **Numeric**: Easy to type and remember
- **Mobile-Friendly**: Works well on all devices

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/projectone

# Authentication
JWT_SECRET=your-jwt-secret-key

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── courses/       # Course management
│   │   ├── learners/      # Learner management
│   │   └── tracks/        # Track management
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utility libraries
│   ├── models/           # MongoDB models
│   ├── services/         # Business logic services
│   ├── auth.ts           # Authentication utilities
│   ├── email.ts          # Email service
│   └── api.ts            # API client
├── stores/               # Zustand stores
├── hooks/                # Custom React hooks
└── middleware.ts         # Next.js middleware
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd projectone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register-admin` - Register new admin
- `POST /api/auth/register-learner` - Register new learner
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-verification` - Resend OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Course Management
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/[id]` - Get course by ID
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### User Management
- `GET /api/learners` - Get all learners
- `POST /api/learners` - Create new learner
- `GET /api/learners/[id]` - Get learner by ID
- `PUT /api/learners/[id]` - Update learner
- `DELETE /api/learners/[id]` - Delete learner

## 🔒 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **OTP Verification**: Time-limited 6-digit codes
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **Environment Variables**: Sensitive data protection

## 📈 Performance Optimizations

- **React Query**: Intelligent caching and background updates
- **Next.js Optimizations**: Automatic code splitting and optimization
- **MongoDB Indexing**: Efficient database queries
- **Zustand**: Minimal re-renders and efficient state updates
- **Image Optimization**: Next.js automatic image optimization

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Development Blog Posts

- [REGISTER-ADMIN.md](./REGISTER-ADMIN.md) - Complete guide to admin registration implementation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- MongoDB team for the robust database
- All open-source contributors who made this project possible

---

**Built with ❤️ by [Samuella](https://samuella.site) during TMP 2 Software Engineering Track**