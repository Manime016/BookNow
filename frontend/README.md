# BookNow Frontend

A modern, professional, and stylish React + Vite frontend for the BookNow event booking platform with comprehensive admin panel.

## Features

✨ **Modern Design**
- Clean, intuitive user interface
- Responsive design for all devices (mobile, tablet, desktop)
- Beautiful gradient color scheme with primary, secondary, and accent colors
- Smooth animations and transitions

🎫 **User Features**
- Browse and search events
- View detailed event information
- Interactive seat selection
- Shopping cart functionality
- Secure checkout process
- User authentication (login/register)
- User dashboard to manage bookings
- Payment processing

👨‍💼 **Admin Features** (New)
- Comprehensive admin dashboard with analytics
- Event management (CRUD operations)
- Venue management
- Booking management and monitoring
- User management
- Payment and revenue tracking
- Advanced analytics and reporting
- Role-based access control

🎨 **Technology Stack**
- **React 18** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **Date-fns** - Date formatting

## Project Structure

```
frontend/
├── public/               # Static assets
│   └── index.html       # Main HTML file
├── src/
│   ├── components/      # Reusable React components
│   │   ├── AdminLayout.jsx      # Admin layout wrapper
│   │   ├── AdminSidebar.jsx     # Admin sidebar navigation
│   │   ├── EventCard.jsx        # Event card component
│   │   ├── Footer.jsx           # Footer component
│   │   ├── Header.jsx           # Header/Navbar component
│   │   ├── LoadingSpinner.jsx   # Loading spinner
│   │   ├── Navbar.jsx           # Navbar alias
│   │   └── Seat.jsx             # Seat selection component
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages (new)
│   │   │   ├── Analytics.jsx    # Analytics & reports
│   │   │   ├── Bookings.jsx     # Booking management
│   │   │   ├── Dashboard.jsx    # Admin dashboard
│   │   │   ├── EventForm.jsx    # Event create/edit
│   │   │   ├── Events.jsx       # Event management
│   │   │   ├── Payments.jsx     # Payment tracking
│   │   │   ├── Users.jsx        # User management
│   │   │   ├── VenueForm.jsx    # Venue create/edit
│   │   │   └── Venues.jsx       # Venue management
│   │   ├── Checkout.jsx         # Checkout page
│   │   ├── Dashboard.jsx        # User dashboard
│   │   ├── EventDetail.jsx      # Event detail page
│   │   ├── Events.jsx           # Events listing page
│   │   ├── Home.jsx             # Home page
│   │   ├── Login.jsx            # Login page
│   │   ├── NotFound.jsx         # 404 page
│   │   └── Register.jsx         # Registration page
│   ├── services/        # API services
│   │   └── api.js             # API client and endpoints
│   ├── store/           # State management
│   │   └── store.js           # Zustand stores (auth, booking, event, cart, admin)
│   ├── styles/          # Global styles
│   │   └── globals.css        # Tailwind CSS and custom styles
│   ├── utils/           # Utility functions
│   │   └── helpers.js         # Helper functions
│   ├── App.jsx          # Main app component with routing
│   └── index.jsx        # Entry point
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## Setup Instructions

### Prerequisites
- Node.js 16+ (includes npm)
- npm or yarn

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your API URL:**
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

## Running the Application

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Integration

The frontend connects to the BookNow backend API. All API calls are made through the `services/api.js` file using Axios.

### Environment Variables
- `VITE_API_URL` - Backend API base URL (default: `http://localhost:8000/api`)

### Available API Services

**Authentication**
- `authAPI.register()` - Register new user
- `authAPI.login()` - Login user
- `authAPI.refresh()` - Refresh JWT token
- `authAPI.me()` - Get current user info

**Events**
- `eventsAPI.getAll()` - List all events
- `eventsAPI.getById()` - Get event details
- `eventsAPI.create()` - Create new event (admin)
- `eventsAPI.update()` - Update event (admin)
- `eventsAPI.delete()` - Delete event (admin)

**Bookings**
- `bookingsAPI.getAll()` - Get all bookings
- `bookingsAPI.getById()` - Get booking details
- `bookingsAPI.create()` - Create new booking
- `bookingsAPI.cancel()` - Cancel booking

**Payments**
- `paymentsAPI.getAll()` - Get all payments (admin)
- `paymentsAPI.create()` - Process payment
- `paymentsAPI.getByBooking()` - Get booking payments

**Seats & Venues**
- `seatsAPI.getByEvent()` - Get event seats
- `venuesAPI.getAll()` - Get all venues (admin)
- `venuesAPI.create()` - Create venue (admin)
- `venuesAPI.update()` - Update venue (admin)

## State Management

The application uses Zustand for state management:

- **useAuthStore** - Authentication state (user, token, role, login/logout)
- **useBookingStore** - Booking state (bookings, current booking)
- **useEventStore** - Event state (events, filters)
- **useCartStore** - Shopping cart (selected seats, total price)
- **useAdminStore** - Admin state (stats, dashboard data) [NEW]

## Authentication & Authorization

### User Roles
- **User** - Standard user with access to events, bookings, and dashboard
- **Admin** - Administrator with access to admin panel and management features

### Login Flow
1. User logs in with email and password
2. Backend returns JWT token and user data (including role)
3. Token stored in localStorage
4. User role stored in auth store
5. Frontend checks `user.role` to determine access level

### Protected Routes
- `/dashboard` - User dashboard (protected, user role)
- `/admin/*` - Admin panel (protected, admin role)
- If user is admin, user routes redirect to admin panel
- If user tries to access admin with user role, redirects to home

## Admin Panel

### Overview
The admin panel provides comprehensive management tools for the BookNow platform.

### Admin Pages

**Dashboard** (`/admin`)
- Key statistics (total events, users, bookings, revenue)
- Monthly overview with trends
- Pending actions and notifications
- Quick action buttons

**Analytics** (`/admin/analytics`)
- Revenue trends
- Booking trends
- Top events
- User demographics
- Key metrics and KPIs

**Events Management** (`/admin/events`)
- List all events with search and filtering
- View event details
- Create new events
- Edit existing events
- Delete events
- Status management (active, draft, archived)

**Event Form** (`/admin/events/new`, `/admin/events/:id`)
- Event details form
- Category selection
- Date and time picker
- Venue and capacity
- Price management
- Image upload
- Status control

**Venues Management** (`/admin/venues`)
- List all venues
- Add new venues
- Edit venue details
- Manage venue capacity
- View associated events

**Venue Form** (`/admin/venues/new`, `/admin/venues/:id`)
- Venue name and location
- Address details
- Capacity management
- Contact information
- Amenities listing

**Bookings Management** (`/admin/bookings`)
- View all platform bookings
- Search and filter bookings
- Booking status tracking
- Payment status verification
- Delete bookings
- Export functionality

**Users Management** (`/admin/users`)
- List all platform users
- Search users by name or email
- View user details
- User contact information
- Booking count and total spending
- User status management

**Payments Management** (`/admin/payments`)
- View all payments
- Payment method tracking
- Payment status overview
- Revenue analytics
- Success rate monitoring
- Export payment reports

### Admin Layout Components

**AdminLayout**
- Main layout wrapper for all admin pages
- Responsive sidebar navigation
- Top navigation bar with user info
- Logout functionality

**AdminSidebar**
- Navigation menu with 8 main sections
- Active page highlighting
- Mobile-responsive (collapses on small screens)
- Quick access to all admin features

## Styling

The project uses Tailwind CSS for styling with a custom color scheme:

- **Primary** - Sky blue (#0ea5e9)
- **Secondary** - Pink (#ec4899)
- **Accent** - Orange (#f97316)
- **Gray** - Professional grayscale palette

Custom utilities and components are defined in `styles/globals.css`

### Custom CSS Classes
- `.btn` - Button base styles
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outline button
- `.btn-ghost` - Ghost button
- `.card` - Card styling
- `.input-base` - Input styling
- `.text-gradient` - Gradient text effect
- `.shadow-glow` - Glow shadow effect

## Components

### Admin Components (New)
- **AdminLayout** - Main admin container with sidebar and top bar
- **AdminSidebar** - Navigation sidebar for admin features

### Existing Components
- **EventCard** - Event information card with image, details, and booking button
- **Seat** - Interactive seat selector with multiple states
- **LoadingSpinner** - Reusable loading indicator
- **Navbar** - Navigation bar (includes admin panel link for admin users)
- **Footer** - Footer with links and contact info

## Pages

### User Pages
- **Home** - Landing page with hero, features, and featured events
- **Events** - Event listing with search, filter, and sort
- **EventDetail** - Event details with seat selection and booking
- **Checkout** - Payment processing
- **Login** - User authentication
- **Register** - New user account creation
- **Dashboard** - User booking management
- **NotFound** - 404 error page

### Admin Pages (New)
- **Admin Dashboard** - Platform overview and statistics
- **Admin Analytics** - Advanced reports and insights
- **Events Management** - CRUD operations for events
- **Event Form** - Create/edit event details
- **Venues Management** - Manage event venues
- **Venue Form** - Create/edit venue details
- **Bookings** - View and manage all bookings
- **Users** - Manage platform users
- **Payments** - Track payments and revenue

## Features in Detail

### User Features
- Authentication with JWT tokens
- Event browsing with search and filters
- Interactive seat selection
- Shopping cart functionality
- Secure payment processing
- Booking management
- User profile and dashboard

### Admin Features
- Complete event lifecycle management
- Venue management and capacity tracking
- Booking oversight and management
- User account management
- Revenue and payment tracking
- Analytics and reporting
- Platform statistics and KPIs

## Responsive Design

The application is fully responsive and works on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)

Admin panel is optimized for:
- Mobile (collapsible sidebar)
- Tablet (responsive tables and grids)
- Desktop (full features)

## Performance

- Fast load times with Vite
- Optimized images
- Lazy loading components
- Efficient state management
- Code splitting for admin and user routes

## Security

- HTTPS-ready
- XSS protection
- CSRF token support
- JWT-based authentication
- Role-based access control
- Protected admin routes
- Secure payment processing

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check `VITE_API_URL` in `.env`
- Check browser network tab for API errors

### Admin Panel Not Accessible
- Ensure user has `role: 'admin'` from backend
- Check localStorage for token and role
- Verify JWT token is not expired
- Check browser console for errors

### Build Issues
- Clear `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear browser cache

### Styling Issues
- Rebuild Tailwind CSS: `npm run build`
- Clear browser cache
- Check browser DevTools for CSS errors

## Backend Requirements

The frontend assumes the backend provides:
- JWT token authentication
- User role information (user vs admin)
- Admin endpoints for managing events, venues, bookings, users, and payments
- Proper authorization checks on backend
- Role-based access control

For backend setup, see the [Backend README](../backend/README.md)

## Development Notes

### Adding New Admin Pages
1. Create new file in `src/pages/admin/`
2. Wrap component with `AdminLayout`
3. Add route to `AdminRoutes` in `App.jsx`
4. Add menu item to `AdminSidebar.jsx`

### Extending State Management
- Add new Zustand store in `src/store/store.js`
- Export store from main store file
- Use hooks in components: `const state = useNewStore()`

### API Integration
- Add new endpoints to `src/services/api.js`
- Use Axios instances with interceptor
- Handle errors consistently
- Return promise-based responses

## Development Tips

- Use React DevTools for debugging
- Check browser Console for errors
- Use Redux DevTools for state debugging
- Test responsive design with device emulation

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

See LICENSE file for details.

## Support

For issues or questions:
- Check the documentation
- Review existing issues
- Contact support@booknow.com
