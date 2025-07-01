# 🎨 Frontend Documentation

The frontend is a modern React application built with TypeScript, Vite, and Tailwind CSS, providing a secure and user-friendly authentication interface.

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── api/              # API integration layer
│   │   └── auth.ts       # Authentication API calls
│   ├── components/       # Reusable UI components
│   │   ├── Alert.tsx     # Alert/notification component
│   │   └── Spinner.tsx   # Loading spinner component
│   ├── context/          # React Context providers
│   │   └── AuthContext.tsx # Authentication state management
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx # User dashboard with 2FA management
│   │   ├── Login.tsx     # Login form
│   │   ├── Register.tsx  # Registration form
│   │   └── Verify.tsx    # 2FA verification
│   ├── styles/           # Style-related files
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0 or Node.js >= 18.0.0
- Backend server running on `http://localhost:3001`

### Installation

```bash
cd frontend
bun install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
```

### Development

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint
```

## 🛠️ Technology Stack

### Core Technologies

- **[React](https://reactjs.org/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[React Router](https://reactrouter.com/)** - Client-side routing

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Heroicons](https://heroicons.com/)** - Beautiful hand-crafted SVG icons
- **[Headless UI](https://headlessui.com/)** - Accessible UI components

### State Management

- **[React Query (TanStack Query)](https://tanstack.com/query)** - Server state management
- **React Context** - Authentication state
- **React Hooks** - Local component state

## 📱 Pages & Components

### Pages

#### Login (`/login`)
- **Purpose**: User authentication
- **Features**: Email/password form, password visibility toggle, 2FA redirect
- **State**: Form validation, loading states, error handling
- **Navigation**: Redirects to `/verify` for 2FA users, `/dashboard` for regular login

#### Register (`/register`)
- **Purpose**: New user registration
- **Features**: Email/password form, validation, success feedback
- **State**: Form data, loading states, validation errors
- **Navigation**: Redirects to `/login` after successful registration

#### Verify (`/verify`)
- **Purpose**: Two-factor authentication verification
- **Features**: TOTP code input, auto-focus, format validation
- **State**: TOTP code, verification status, error handling
- **Navigation**: Redirects to `/dashboard` after successful verification

#### Dashboard (`/dashboard`)
- **Purpose**: User management and 2FA settings
- **Features**: User info display, 2FA enable/disable, QR code setup
- **State**: User data, 2FA setup modal, loading states
- **Protection**: Requires valid authentication token

### Components

#### AuthContext
- **Purpose**: Global authentication state management
- **Features**: Token persistence, loading states, logout functionality
- **Storage**: localStorage for token persistence across sessions

```typescript
interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  loading: boolean;
}
```

#### Alert Component
- **Purpose**: User feedback and notifications
- **Types**: Success, error, warning, info
- **Features**: Consistent styling, dismissible, accessible

```typescript
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  dismissible?: boolean;
}
```

#### Spinner Component
- **Purpose**: Loading state indication
- **Features**: Multiple sizes, consistent styling, accessibility

## 🔐 Authentication Flow

### Registration Flow
1. User enters email and password
2. Form validation (client-side)
3. API call to `/api/register`
4. Success → Redirect to login
5. Error → Display error message

### Login Flow
1. User enters credentials
2. API call to `/api/login`
3. **If 2FA disabled:**
   - Receive token
   - Store in context/localStorage
   - Redirect to dashboard
4. **If 2FA enabled:**
   - Store credentials in sessionStorage
   - Redirect to verification page

### 2FA Verification Flow
1. User enters TOTP code
2. API call to `/api/login-2fa` with stored credentials
3. Receive token
4. Store in context/localStorage
5. Clear temporary credentials
6. Redirect to dashboard

### Route Protection
```typescript
// Protected route example
<Route 
  path="/dashboard" 
  element={token ? <Dashboard /> : <Navigate to="/login" />} 
/>
```

## 🎨 Styling & Design

### Design System

**Colors:**
- Primary: Blue gradient (`from-blue-500 to-purple-500`)
- Success: Green (`green-600`)
- Error: Red (`red-600`)
- Warning: Yellow (`yellow-600`)
- Neutral: Gray scale

**Typography:**
- Headings: `font-bold` with appropriate sizes
- Body: Default system fonts
- Code: `font-mono` for TOTP codes

**Layout:**
- Centered forms with consistent max-width
- Responsive design (mobile-first)
- Consistent spacing using Tailwind spacing scale

### Component Patterns

**Form Styling:**
```css
.input-field {
  @apply mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition;
}

.button-primary {
  @apply w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-200;
}
```

**Card Layout:**
```css
.card {
  @apply w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 transition-all duration-300;
}
```

## 🔄 State Management

### Authentication State (Context)

```typescript
// AuthProvider manages global auth state
const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setTokenState(storedToken);
    setLoading(false);
  }, []);

  // Persist token changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);
};
```

### Server State (React Query)

```typescript
// User data fetching with React Query
const { data: user, isLoading, error } = useQuery({
  queryKey: ['userInfo', token],
  queryFn: () => getUserInfo(token!),
  enabled: !!token && !loading,
  retry: false
});

// Mutations for API calls
const mutation = useMutation({
  mutationFn: () => loginApi(email, password),
  onSuccess: (data) => {
    if (data.token) {
      setToken(data.token);
      navigate('/dashboard');
    }
  },
  onError: (error) => {
    setError('Login failed');
  }
});
```

### Form State (Local)

```typescript
// Local form state with validation
const [formData, setFormData] = useState({
  email: '',
  password: '',
  confirmPassword: ''
});

const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
```

## 🛡️ Security Considerations

### Token Management
- **Storage**: localStorage for persistence, cleared on logout
- **Expiration**: Handled by backend (7-day expiry)
- **Validation**: Token presence checked before API calls

### Input Validation
- **Client-side**: Real-time validation for better UX
- **Server-side**: All validation enforced on backend
- **Sanitization**: Prevent XSS through proper React practices

### Route Protection
- **Authentication**: Routes protected by token presence
- **Authorization**: Backend validates all requests
- **Redirects**: Automatic redirects for unauthorized access

### Sensitive Data
- **Passwords**: Never stored in frontend state
- **Tokens**: Cleared on logout and errors
- **2FA Codes**: Cleared after successful verification

## 🧪 Testing

### Manual Testing Checklist

**Registration:**
- [ ] Valid email and password acceptance
- [ ] Invalid email format rejection
- [ ] Short password rejection
- [ ] Duplicate email handling
- [ ] Success redirect to login

**Login:**
- [ ] Valid credentials acceptance
- [ ] Invalid credentials rejection
- [ ] 2FA user redirect to verification
- [ ] Non-2FA user redirect to dashboard
- [ ] Token storage verification

**2FA Verification:**
- [ ] Valid TOTP code acceptance
- [ ] Invalid code rejection
- [ ] Auto-focus on code input
- [ ] Success redirect to dashboard
- [ ] Credentials cleanup after success

**Dashboard:**
- [ ] User information display
- [ ] 2FA status indication
- [ ] QR code generation for setup
- [ ] 2FA enable/disable functionality
- [ ] Logout functionality

### Test Data

```typescript
// Test user credentials (ensure these exist in backend)
const testUsers = {
  withoutTwoFA: {
    email: 'user@example.com',
    password: 'password123'
  },
  withTwoFA: {
    email: 'user-2fa@example.com',
    password: 'password123'
  }
};
```

## 🚀 Build & Deployment

### Development Build
```bash
bun run dev
# Serves on http://localhost:5173 with hot reload
```

### Production Build
```bash
bun run build
# Creates optimized build in dist/ directory
```

### Build Configuration

**Vite Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Enable for debugging
    minify: true
  },
  server: {
    port: 5173,
    host: true // Allow external access
  }
});
```

### Deployment Options

**Static Hosting (Netlify, Vercel):**
1. Build the application (`bun run build`)
2. Deploy the `dist` folder
3. Configure environment variables
4. Set up redirects for SPA routing

**Docker Deployment:**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🛠️ Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled, proper typing
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Consistent code formatting
- **Naming**: PascalCase for components, camelCase for functions

### Component Structure
```typescript
// Component template
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 = 0 }) => {
  // Hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

### API Integration
```typescript
// API call pattern
export async function apiFunction(params: ParamsType): Promise<ResponseType> {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

### Error Handling
- **Graceful Degradation**: App remains functional with errors
- **User Feedback**: Clear error messages for users
- **Logging**: Console logs for debugging (removed in production)
- **Recovery**: Retry mechanisms where appropriate

## 🤝 Contributing

When contributing to the frontend:

1. **Code Quality**: Follow TypeScript and React best practices
2. **Testing**: Manually test all affected functionality
3. **Accessibility**: Ensure components are accessible
4. **Performance**: Optimize bundle size and loading times
5. **Documentation**: Update documentation for new features
6. **Responsive**: Ensure mobile compatibility

### Common Tasks

**Adding a new page:**
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation if needed
4. Add any required API calls

**Adding a new component:**
1. Create component in `src/components/`
2. Export from component file
3. Add TypeScript interfaces
4. Include in storybook (if applicable)

**Adding API integration:**
1. Add function to `src/api/auth.ts`
2. Define TypeScript interfaces
3. Add error handling
4. Update React Query usage

## 📞 Troubleshooting

### Common Issues

**Build Errors:**
- Check TypeScript errors: `bun run type-check`
- Verify imports and exports
- Ensure all dependencies are installed

**API Connection:**
- Verify `VITE_API_BASE_URL` environment variable
- Check backend server is running
- Inspect network tab for CORS errors

**Authentication Issues:**
- Clear localStorage: `localStorage.clear()`
- Check token format and expiration
- Verify backend JWT secret matches

**Styling Issues:**
- Rebuild Tailwind classes: `bun run build`
- Check for conflicting CSS
- Verify Tailwind configuration

### Debug Mode

Enable debug logging:
```typescript
// Add to main.tsx for development
if (import.meta.env.DEV) {
  window.localStorage.setItem('debug', 'auth:*');
}
```
