# Overview

This is a full-stack web application for "Prime UI" - an auto-clicker desktop application with advanced color detection features. The system serves as both a user management platform and distribution center, allowing users to register, authenticate, manage access keys, and download the desktop application. The platform includes comprehensive admin functionality for user management and access key generation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern development
- **Wouter** for client-side routing instead of React Router for lighter bundle size
- **shadcn/ui** component library built on Radix UI primitives for consistent, accessible UI components
- **Tailwind CSS** for utility-first styling with a custom dark theme configuration
- **TanStack Query** for server state management, caching, and data fetching
- **React Hook Form** with Zod validation for form handling and client-side validation
- **Vite** as the build tool and development server for fast hot module replacement

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints and middleware
- **Passport.js** with local strategy for authentication and session management
- **Express sessions** with PostgreSQL session store for persistent login state
- **Bcrypt** for secure password hashing with salt
- **Custom middleware** for request logging and error handling
- **Modular route structure** separating authentication, user management, and API logic

## Database Layer
- **Drizzle ORM** with TypeScript for type-safe database operations
- **Neon PostgreSQL** serverless database for scalable data storage
- **Shared schema** between frontend and backend for consistent type definitions
- **Database tables**: users, access_keys, login_attempts for comprehensive user management
- **Automatic migrations** through Drizzle Kit for schema version control

## Authentication & Authorization
- **Session-based authentication** with secure HTTP-only cookies
- **Hardware ID (HWID) binding** for desktop application security
- **IP address tracking** for login attempt monitoring
- **Role-based access control** with admin and regular user permissions
- **Desktop app authentication** endpoint for validating keys and HWID
- **Comprehensive login attempt logging** for security monitoring

## Key Management System
- **Access key generation** with customizable expiration dates
- **Key prefix system** for organizational purposes
- **Usage tracking** with timestamps and activity monitoring
- **Admin controls** for key lifecycle management
- **Bulk key operations** for administrative efficiency

## Security Features
- **Password hashing** with scrypt algorithm for cryptographic security
- **Session management** with secure cookie configuration
- **CSRF protection** through session-based authentication
- **Input validation** using Zod schemas on both client and server
- **Hardware fingerprinting** for desktop application access control
- **Rate limiting** considerations for login attempts

## Deployment Architecture
- **Replit-optimized** with specific plugins for development environment
- **Production build** separation with esbuild for server bundling
- **Static asset serving** with Vite-generated client bundle
- **Environment-based configuration** for development vs production
- **Session storage** using connect-pg-simple for PostgreSQL persistence

# External Dependencies

## Database & Storage
- **Neon Database** - Serverless PostgreSQL database for user data, access keys, and session storage
- **WebSocket support** via ws library for Neon database connections

## Authentication Services
- **Passport.js ecosystem** - Local authentication strategy with session management
- **connect-pg-simple** - PostgreSQL session store for Express sessions

## UI Component Libraries
- **Radix UI** - Comprehensive primitive components for accessibility and functionality
- **Lucide React** - Icon library for consistent iconography
- **shadcn/ui** - Pre-built component system built on Radix primitives

## Development Tools
- **Replit-specific plugins** - Development banner, cartographer, and error overlay for enhanced development experience
- **Vite ecosystem** - React plugin, TypeScript support, and development server

## Validation & Forms
- **Zod** - Runtime type validation for both client and server
- **React Hook Form** - Form state management with validation integration
- **Hookform Resolvers** - Zod integration for form validation

## Styling & Assets
- **Tailwind CSS** - Utility-first CSS framework with custom theming
- **PostCSS** - CSS processing with autoprefixer for browser compatibility
- **Google Fonts** - Web font loading for typography

## Date & Utility Libraries
- **date-fns** - Date manipulation and formatting
- **clsx & tailwind-merge** - Conditional CSS class handling
- **nanoid** - Unique ID generation for various system components