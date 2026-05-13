# Chizo's React Template

A modern React template with authentication, routing, admin dashboard, and public-facing pages, built with TypeScript, Vite, and Tailwind CSS.

## Features

- **Quiet Premium Design System**: A refined, modern design with a focused color palette (Blue, Charcoal, Cream) and neutral Inter typography.
- **Authentication System**: Login/logout with JWT tokens, protected routes based on account types (can be replaced with Firebase Auth).
- **Admin Dashboard**: Comprehensive admin interface with sidebar navigation, user management, and analytics.
- **Public Pages**: Modern landing page with a hero section, staggered feature grid, and integrated animations.
- **Smooth Motion**: Native support for scroll-linked and entry animations using Framer Motion.
- **SEO Optimization**: Generic SEO component for managing meta tags, Open Graph, and Twitter Cards.
- **Responsive Design**: Mobile-first design using Tailwind CSS and Radix UI components.
- **TypeScript**: Full type safety throughout the application
- **Modern Tooling**: Vite for fast development, ESLint for code quality, and pnpm for package management
- **Routing**: Client-side routing with React Router, including nested routes and protected access
- **Optional Firebase Integration**: Authentication, database (Firestore), and file storage

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Radix UI
- **Animations**: Framer Motion
- **Routing**: React Router DOM (v7)
- **State Management**: React Context (for auth)
- **Backend (Optional)**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **Notifications**: Sonner for toast notifications

## Design System

The template follows a **Quiet Premium** design philosophy:
- **Colors**: Charcoal for primary text, Gray-dark for body, Blue for CTAs, and Cream/White for section backgrounds.
- **Typography**: Uses the **Inter** font family for a clean, neutral, and professional look.
- **Motion**: Noticeable but non-distracting animations with a focus on smooth page entry and scroll-linked events.
- **Spacing**: Generous padding and wide-set layouts to ensure content has room to breathe.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ChisomoM/c-react-template.git
   cd c-react-template
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Linting

```bash
pnpm lint
```

## Project Structure

```
src/
├── (admin)/
│   └── admin/
│       ├── Admin.tsx              # Main Admin Dashboard
│       └── LoginPage.tsx          # Admin login page
├── (public)/
│   └── home/
│       ├── home.tsx               # Premium landing page
│       └── components/            # Page sections (hero, features, etc.)
├── components/
│   ├── ui/                        # Reusable UI components (Radix UI wrappers)
│   ├── auth/                      # Authentication components
│   ├── footer.tsx                 # Site footer
│   ├── navbar.tsx                 # Navigation bar
│   └── ...
├── layouts/
│   ├── AdminLayout.tsx            # Layout for protected admin areas
│   └── MainLayout.tsx             # Layout for public pages
├── lib/
│   ├── context/                   # Global state (Auth, User)
│   ├── api/                       # API utilities (crud, endpoints)
│   ├── firebase/                  # Optional Firebase service layer
│   └── utils.ts                   # Tailwind merge and class utilities
├── types/
│   └── auth.ts                    # TypeScript type definitions
└── assets/                        # Static assets (logos, images)
```

## Architecture & Key Components

### API & Data Fetching
The project uses a structured approach for data fetching to ensure consistency across the application.
- **`fetchData`**: A custom utility in `@/lib/api/crud` that automatically attaches Bearer tokens from storage and handles common error scenarios.
- **Endpoint Mapping**: All API paths are defined in `@/lib/api/end_points.tsx` within the `API` object. This makes it easy to update URLs in one place.
- **Parameterized Routes**: The `pipe` utility allows for dynamic URL generation (e.g., `users/:id`).

**Usage:**
```typescript
import { fetchData } from '@/lib/api/crud';

// GET request
const data = await fetchData('SOME_ENDPOINT_KEY', 'GET');

// POST request with payload
await fetchData('SOME_ENDPOINT_KEY', 'POST', {}, payload);
```

### Authentication & Security
- **Auth Context**: The `AuthContext` (managed via `useAuth()`) provides access to the current `user`, `tokens`, and methods like `login` and `logout`.
- **Protected Routes**: Wrap routes with the `<ProtectedRoute>` component to restrict access to authenticated users.
- **Persistence**: Auth tokens and user data are persisted in `localStorage` using keys defined in `STORAGE_KEYS` (`auth_tokens`, `auth_user`).

### SEO Optimization
The template includes a generic SEO component for managing meta tags, Open Graph, and Twitter Cards using `react-helmet-async`.

**Usage:**
```tsx
import SEO from '../components/SEO';

<SEO
  title="Page Title"
  description="Page description"
  keywords="key1, key2"
  type="website"
/>
```

### UI Components
- **Radix UI**: Built on Radix UI primitives for high accessibility.
- **Tailwind CSS**: Utility-first styling for fast, responsive design.
- **Lucide Icons**: Consistent, lightweight iconography.

## Customization

### Adding New Pages
1. Create your component in the appropriate folder (`(public)` or `(admin)`)
2. Add the route to `App.tsx`
3. Use `ProtectedRoute` if authentication is required

### Styling
- Modify `tailwind.config.js` for custom themes
- Update component classes directly or use CSS modules
- Global styles in `src/index.css`

### API Integration
- Update endpoints mapping in `src/lib/api/end_points.tsx`.
- Modify API calls using `fetchData` in your components.
- Adjust global state logic in `src/lib/context/auth.tsx`.
- **Optional**: Configure Firebase services (see Firebase Integration section).

## Firebase Integration (Optional)

This template includes optional Firebase integration for authentication, database, and storage. Firebase is not required and can be easily removed.

### Setup Firebase

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, and Storage as needed
3. Get your Firebase config from Project Settings

### Environment Variables

Add to your `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Using Firebase Auth

```tsx
import { signInWithFirebase, signUpWithFirebase, signOutFromFirebase } from '@/lib/firebase';

const handleLogin = async () => {
  try {
    const user = await signInWithFirebase(email, password);
    console.log('Logged in:', user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Using Firestore

```tsx
import { FirebaseFirestore } from '@/lib/firebase';

const getUsers = async () => {
  const users = await FirebaseFirestore.getCollection('users');
  console.log(users);
};

const addUser = async () => {
  const userId = await FirebaseFirestore.addDocument('users', {
    name: 'John Doe',
    email: 'john@example.com'
  });
  console.log('Added user with ID:', userId);
};
```

### Using Storage

```tsx
import { FirebaseStorage } from '@/lib/firebase';

const uploadFile = async (file: File) => {
  const downloadURL = await FirebaseStorage.uploadFile(`uploads/${file.name}`, file);
  console.log('File uploaded:', downloadURL);
};
```

### Removing Firebase

To remove Firebase integration:

1. Delete the `src/lib/firebase/` directory
2. Delete `src/lib/auth/firebaseAuth.ts`
3. Remove `firebase` from `package.json`
4. Remove Firebase environment variables from `.env`
5. Remove any Firebase imports from your components

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.
# nfs-proxy-frontend
