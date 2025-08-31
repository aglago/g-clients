# G-Clients - Learning Management System

A comprehensive full-stack Learning Management System (LMS) built with modern web technologies. This platform enables administrators to manage learning tracks and courses while providing learners with an intuitive portal for course enrollment, progress tracking, and profile management.

## 🚀 Project Overview

G-Clients is a production-ready LMS featuring dual authentication systems, comprehensive course management, automated payment processing, and real-time analytics. The platform supports track-based learning with integrated billing and progress tracking capabilities.

### ✨ Key Features

- **👥 Dual User Management**: Separate admin dashboard and learner portal with role-based authentication
- **📚 Track & Course Management**: Hierarchical learning structure with tracks containing multiple courses
- **🎯 Smart Enrollment System**: Automated checkout flow with account creation and payment processing
- **📈 Progress Tracking**: Real-time learning progress with completion tracking and rating system
- **💳 Integrated Billing**: Complete invoice management with simulated payment processing (ready for real gateway integration)
- **📧 Email Automation**: Automated notifications for registration, enrollment, and payment events
- **🔐 Secure Authentication**: JWT-based auth with OTP email verification and password reset
- **📊 Analytics Dashboard**: Revenue charts, enrollment metrics, and comprehensive reporting
- **🎨 Modern UI**: Responsive design with Tailwind CSS and Shadcn/ui components
- **☁️ Cloud Integration**: Cloudinary integration for image uploads and management

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript 5.0.0
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Shadcn/ui with Radix UI primitives
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query) v5
- **HTTP Client**: Axios
- **Charts**: Recharts for analytics
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast notifications)

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs with 12 salt rounds
- **Email Service**: Nodemailer with Gmail SMTP
- **File Storage**: Cloudinary
- **OTP System**: Time-limited 6-digit verification codes

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Version Control**: Git

## 📱 Application Structure

### Public Pages
- **Landing Page** (`/`) - Hero section, track showcase, statistics, and call-to-actions
- **Track Catalog** (`/tracks`) - Browse tracks with search and filtering capabilities
- **Track Details** (`/tracks/[slug]`) - Individual track information with enrollment options
- **Checkout Flow** (`/checkout`) - Comprehensive enrollment process with payment integration

### Admin Dashboard (`/admin/dashboard/`)
- **Overview** - Metrics cards, revenue charts, and recent activity
- **Track Management** - CRUD operations with modal-based forms
- **Course Management** - Individual course creation and editing
- **Learner Management** - User profile management and enrollment tracking
- **Invoice Management** - Payment records and billing overview
- **Reports** - Advanced analytics and data visualization
- **Profile Settings** - Admin account management

### Learner Portal (`/portal`)
- **Dashboard** - Enrolled tracks, course progress, and learning statistics
- **Settings** - Profile editing with image upload and personal information
- **Invoice History** - Payment records and enrollment receipts

### Authentication System
- **Dual Registration** - Separate flows for admin and learner accounts
- **Unified Login** - Single login page with role-based redirection
- **Email Verification** - OTP-based account activation
- **Password Reset** - Secure token-based password recovery

## 🗃️ Database Schema

### Core Models
- **User**: Unified user model supporting admin/learner roles with profile data
- **Track**: Learning tracks with pricing, duration, and course associations
- **Course**: Individual courses belonging to tracks
- **Invoice**: Payment records linking learners to track enrollments
- **TrackEnrollment**: Progress tracking for learner-track relationships
- **CourseRegistration**: Individual course completion tracking

### Key Relationships
- Users have many TrackEnrollments and Invoices
- Tracks contain many Courses and generate Invoices
- Enrollments track progress and link Users to Tracks

## 🔧 Environment Configuration

### Required Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your-database-name

# JWT Authentication
JWT_SECRET=your-long-random-jwt-secret-key-here

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Your-App-Name

# Cloudinary Image Upload
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                   # Admin dashboard pages
│   │   └── dashboard/           # Admin features (tracks, courses, learners, etc.)
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── checkout/           # Enrollment and payment processing
│   │   ├── tracks/             # Track management
│   │   ├── courses/            # Course management
│   │   ├── learners/           # Learner management
│   │   ├── invoices/           # Invoice management
│   │   └── public/             # Public API endpoints
│   ├── (auth)/                 # Authentication pages
│   ├── portal/                 # Learner portal
│   ├── tracks/                 # Track catalog and details
│   ├── checkout/               # Enrollment checkout flow
│   └── globals.css             # Global styles and Tailwind imports
├── components/                  # Reusable UI components
│   ├── admin/                  # Admin-specific components
│   ├── auth/                   # Authentication components and guards
│   ├── charts/                 # Analytics and data visualization
│   ├── dashboard/              # Dashboard-specific components
│   ├── forms/                  # Form components
│   ├── icons/                  # Custom icon components
│   ├── learner/               # Learner-facing components
│   ├── modals/                # Modal dialogs
│   └── ui/                    # Shadcn/ui base components
├── lib/                        # Utilities and configurations
│   ├── models/                # Mongoose database models
│   ├── services/              # Business logic and database services
│   ├── api.ts                 # API client and endpoints
│   ├── auth.ts                # Authentication utilities
│   ├── dashboard-analytics.ts # Analytics calculations
│   ├── email.ts               # Email service configuration
│   └── utils.ts               # Common utility functions
├── stores/                     # Zustand state stores
│   └── authStore.ts           # Authentication state management
└── middleware.ts              # Next.js middleware for route protection
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd g-clients
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
   # Using local MongoDB
   mongod
   
   # Or using MongoDB Atlas (update MONGODB_URI in .env)
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

7. **Access Admin Dashboard**
   ```
   http://localhost:3000/admin/dashboard
   # Create admin account at /admin/register
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register-admin` - Register new administrator
- `POST /api/auth/register-learner` - Register new learner
- `POST /api/auth/login` - Unified login for both roles
- `POST /api/auth/verify-email` - Verify email with OTP code
- `POST /api/auth/resend-verification` - Resend OTP code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Complete password reset
- `PUT /api/auth/update-user` - Update user profile
- `GET /api/auth/check` - Verify authentication status

### Content Management
- `GET/POST /api/tracks` - Track management
- `GET/PUT/DELETE /api/tracks/[id]` - Individual track operations
- `GET/POST /api/courses` - Course management
- `GET/PUT/DELETE /api/courses/[id]` - Individual course operations
- `GET/POST /api/learners` - Learner management
- `GET/PUT/DELETE /api/learners/[id]` - Individual learner operations

### Enrollment & Payment
- `POST /api/checkout/process` - Process new user enrollment
- `POST /api/checkout/authenticated` - Process existing user enrollment
- `GET/POST /api/invoices` - Invoice management
- `GET /api/invoices/user` - User's invoice history
- `GET/POST /api/track-enrollments` - Enrollment tracking
- `GET/POST /api/course-registrations` - Course registration tracking

### Public & Utility
- `GET /api/public/stats` - Public statistics for landing page
- `POST /api/upload` - File upload to Cloudinary
- `GET /api/enrollments/[userId]` - User enrollment data

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Role-Based Access**: Separate admin and learner permissions
- **Route Protection**: Middleware-based route guarding
- **OTP Verification**: Email-based account activation
- **Password Security**: bcryptjs hashing with salt rounds

### Data Protection
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses without data leakage
- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Controlled cross-origin requests

### Payment Security
- **User Verification**: Prevents unauthorized charges to existing accounts
- **Invoice Tracking**: Complete audit trail for all transactions
- **Secure Checkout**: Multi-step verification process with simulated payment flow
- **Ready for Integration**: Architecture prepared for real payment gateway implementation

## 📈 Analytics & Reporting

### Admin Dashboard Metrics
- **Real-time Statistics**: Total learners, revenue, and invoices
- **Trend Analysis**: Month-over-month growth indicators
- **Revenue Charts**: Interactive time-series data visualization
- **Enrollment Tracking**: Student progress and completion rates

### Advanced Analytics
- **Time Period Selection**: 1, 3, 6, or 12-month views
- **Data Filtering**: Filter by status, date ranges, and categories
- **Export Capabilities**: Data export for external analysis

## 🎨 UI/UX Features

### Design System
- **Consistent Theming**: Unified color palette and typography
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG-compliant components with keyboard navigation
- **Loading States**: Skeleton screens and progress indicators

### User Experience
- **Smart Navigation**: Context-aware menu options
- **Toast Notifications**: Non-intrusive user feedback
- **Modal Interactions**: Overlay-based forms and confirmations
- **Search & Filtering**: Advanced content discovery tools

## 🧪 Development & Testing

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
```

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Consistent code style and error detection
- **Prettier**: Automated code formatting
- **Modular Architecture**: Separation of concerns and reusable components

## 🚀 Deployment

### Production Build
1. Set production environment variables
2. Build the application: `npm run build`
3. Start the production server: `npm start`

### Environment Considerations
- MongoDB connection string for production database
- SMTP configuration for email services
- Cloudinary credentials for file uploads
- Secure JWT secret generation

## 📝 Key Business Features

### Learning Management
- **Track-Based Learning**: Structured learning paths with multiple courses
- **Progress Tracking**: Real-time completion percentages and milestones
- **Flexible Enrollment**: Support for both free and paid tracks
- **Instructor Management**: Track assignment to specific instructors

### Payment Processing
- **Automated Invoicing**: Instant invoice generation upon enrollment
- **Payment Status Tracking**: Complete audit trail for all transactions
- **Simulated Payment Flow**: Payment processing simulation ready for real gateway integration
- **Failed Payment Handling**: Graceful handling with retry mechanisms
- **Email Notifications**: Automated communication for all payment events

### Administrative Tools
- **Comprehensive Dashboard**: Single-pane-of-glass for all operations
- **User Management**: Complete CRUD operations for all user types
- **Content Management**: Easy track and course creation and editing
- **Reporting Suite**: Advanced analytics and data visualization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain component modularity
- Write descriptive commit messages
- Test new features thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the exceptional full-stack framework
- **Shadcn/ui** - For the beautiful, accessible component library
- **MongoDB** - For the flexible, scalable database solution
- **Tailwind CSS** - For the utility-first styling approach
- **Open Source Community** - For the tools and libraries that made this possible

---

**Built with ❤️ by [Samuella](https://samuella.site) during TMP 2 Software Engineering Track**