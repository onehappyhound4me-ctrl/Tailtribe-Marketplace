# 🐾 TailTribe - Pet Services Marketplace

**A comprehensive pet services platform connecting pet owners with trusted caregivers across Belgium.**

Built with Next.js 14, TypeScript, Prisma, and modern web technologies.

## ✨ Features

### 🔍 **Smart Search & Discovery**
- Advanced search with filters (location, service type, price range)
- SEO-optimized city landing pages for all Belgian provinces
- Real-time availability checking

### 👥 **User Management** 
- Magic link authentication via NextAuth
- Role-based access (Owner, Caregiver, Admin)
- Comprehensive caregiver profiles with photos and reviews

### 📅 **Booking System**
- Complete booking flow: Request → Accept → Pay → Review
- Real-time messaging between users
- Automated notifications and confirmations

### 💳 **Payment Integration**
- Stripe Connect Express for caregiver payouts
- Secure payment processing
- Platform fee management

### 📱 **Modern UI/UX**
- Responsive design with Tailwind CSS
- shadcn/ui components
- Mobile-first approach
- Accessible and user-friendly

### 🎬 **Story Highlights**
- YouTube/Vimeo video embeds for caregivers
- Auto-expiring highlights (14 days)
- SEO-friendly with transcripts

### 🛡️ **Admin Dashboard**
- User and caregiver management
- Booking oversight
- Platform statistics and analytics
- Approval workflows

### 🌍 **SEO & Performance**
- Dynamic sitemap generation
- OpenGraph and Twitter Card meta tags
- Structured data (JSON-LD)
- Server-side rendering
- Image optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TailTribe-Final
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values (zie .env.example voor alle opties).

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Seed the database**
   ```bash
   npx ts-node prisma/seed-simple.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Schema

The platform uses SQLite for development (easily switchable to PostgreSQL for production):

- **Users**: Authentication and basic profile info
- **CaregiverProfiles**: Extended profiles for service providers
- **Listings**: Service offerings from caregivers
- **Bookings**: Complete booking lifecycle management
- **Messages**: Real-time communication
- **Reviews**: Rating and feedback system
- **StoryHighlights**: Video content with auto-expiry
- **Availability**: Schedule management

## 🛠️ Tech Stack

### Core Framework
- **Next.js 14** - App Router, Server Components, Server Actions
- **TypeScript** - Full type safety
- **React 18** - Latest React features

### Database & ORM
- **Prisma** - Type-safe database client
- **SQLite** - Development database (PostgreSQL ready)

### Authentication
- **NextAuth.js** - Secure authentication
- **Magic Links** - Passwordless email authentication

### Styling & UI
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Lucide Icons** - Beautiful icon set

### Validation & Forms
- **Zod** - Runtime type validation
- **React Hook Form** - Form management

### Payments
- **Stripe Connect Express** - Marketplace payments
- **Webhooks** - Event handling

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── be/                # Belgian city landing pages
│   ├── booking/           # Booking flow
│   ├── caregivers/        # Caregiver profiles
│   ├── dashboard/         # User dashboard
│   ├── messages/          # Messaging system
│   └── search/            # Search functionality
├── components/            # Reusable components
│   ├── brand/            # Branding components
│   ├── caregiver/        # Caregiver-specific components
│   ├── ui/               # shadcn/ui components
│   └── video/            # Video/story components
├── data/                 # Static data (Belgian geo data)
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication configuration
│   ├── db.ts             # Database client
│   ├── errors.ts         # Error handling
│   ├── rate-limit.ts     # Rate limiting
│   ├── seo.ts            # SEO utilities
│   └── stripe.ts         # Payment processing
├── schemas/              # Zod validation schemas
└── styles/               # Global styles
```

## 🎯 Key Pages

### Public Pages
- **Home** (`/`) - Landing page with stats and CTAs
- **Search** (`/search`) - Find caregivers with filters
- **Caregiver Profiles** (`/caregivers/[id]`) - Detailed provider profiles
- **City Pages** (`/be/[province]/[city]`) - Local SEO pages

### Protected Pages  
- **Dashboard** (`/dashboard`) - Role-based user dashboard
- **Booking Flow** (`/booking/*`) - Complete booking process
- **Messages** (`/messages/*`) - Communication system
- **Admin Panel** (`/admin`) - Platform management

## 🔧 Configuration

### Environment Variables
See `.env.example` for all required environment variables.

**Minimaal vereist voor development:**
- `DATABASE_URL` - SQLite database pad
- `NEXTAUTH_URL` - http://localhost:3000
- `NEXTAUTH_SECRET` - Genereer met: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Voor Google login

**Optioneel:**
- Stripe keys - Voor betalingen
- Email server - Voor magic links
- Mapbox token - Voor map functionaliteit

### Database
- Development: SQLite (`file:./dev.db`)
- Production: PostgreSQL (update `DATABASE_URL`)

### Authentication
- Magic links via email (console logging in development)
- Production: Configure Resend API key

### Payments
- Stripe Connect Express for marketplace payments
- Configure webhooks for event handling

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Other Platforms
1. Build the application: `npm run build`
2. Set up PostgreSQL database
3. Run migrations: `npx prisma migrate deploy`
4. Start the application: `npm start`

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test
```

### E2E Tests (Playwright)  
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run typecheck
```

## 📊 Features Status

✅ **Completed**
- User authentication and authorization
- Database setup with comprehensive schema
- Caregiver search and filtering
- Complete booking flow (UI)
- Real-time messaging (UI)
- Admin dashboard
- SEO city landing pages
- Sitemap and robots.txt generation

🔄 **In Progress**
- Stripe Connect Express integration
- Email notifications
- File upload system
- Advanced testing suite

📋 **Planned**
- Multi-language support (NL/FR/EN)
- Advanced analytics
- Mobile app (React Native)
- API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is proprietary. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for pet lovers across Belgium** 🇧🇪










