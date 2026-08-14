# Login Page - Component Integration Reference

## Component Hierarchy

```
App (Next.js Router)
└── /login
    └── LoginPage (page.tsx)
        ├── StatusMessage (for success alerts)
        ├── Form
        │   ├── Input (email)
        │   ├── Input (password)
        │   └── Button (sign in)
        └── Helper Text (demo credentials)
```

## Component Props Used

### Input Component
```tsx
<Input
  type="email"
  label="Email address"
  placeholder="name@example.com"
  value={email}
  onChange={(e) => handleInputChange('email', e.target.value)}
  error={errors.email}        // Shows error if present
  disabled={loading || success}
  autoComplete="email"
  autoFocus
/>
```

### Button Component
```tsx
<Button 
  type="submit" 
  className="w-full" 
  loading={loading}            // Shows loading state
  disabled={success}
>
  {loading ? 'Signing in...' : 'Sign in'}
</Button>
```

### StatusMessage Component
```tsx
<StatusMessage 
  title="Login successful" 
  message="Redirecting to dashboard..." 
  type="success"  // Can be: success | error | info
/>
```

## State Management

```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState<FormErrors>({});
const [loading, setLoading] = useState(false);
const [serverError, setServerError] = useState('');
const [success, setSuccess] = useState(false);
```

## Form Flow

```
User Input
    ↓
Form Submission
    ↓
validateForm()
    ├─ Email validation
    │   ├─ Required check
    │   └─ Format check (regex)
    ├─ Password validation
    │   ├─ Required check
    │   └─ Length check (min 6)
    └─ Return true/false
    ↓
If Invalid → Show errors
    ↓
If Valid → setLoading(true)
    ↓
Simulate API Call (1500ms)
    ↓
Check Credentials
    ├─ If admin@example.com/password → Success
    │   └─ setSuccess(true)
    │       └─ Show success message
    └─ If other credentials → Error
        └─ setServerError('Invalid...')
            └─ Show error message
    ↓
setLoading(false)
```

## Error Handling

### Validation Errors (Client-side)
- Email required: `"Email is required"`
- Invalid email: `"Please enter a valid email address"`
- Password required: `"Password is required"`
- Password too short: `"Password must be at least 6 characters"`

### Server Errors (Simulated)
- Invalid credentials: `"Invalid email or password"`
- Generic error: `"An error occurred. Please try again."`

## Styling Classes

### Layout
- Container: `min-h-screen flex items-center justify-center`
- Card: `rounded-lg border border-slate-200 shadow-panel p-8`
- Form: `space-y-5` (5 units between form elements)

### Colors (AWS Themed)
- Background: `bg-gradient-to-br from-slate-50 to-slate-100`
- Accent: `bg-aws-orange` (#ff9900)
- Dark accent: `hover:bg-aws-orangeDark` (#f58220)
- Text: `text-slate-900` (dark), `text-slate-500` (muted)

### Responsive
- Mobile: Full width with `px-4` padding
- Desktop: `max-w-md` (28rem max width)

## Event Handlers

### handleInputChange
```tsx
Clears errors for the field as user types
Prevents showing stale errors during editing
```

### handleSubmit
```tsx
e.preventDefault()           // Prevent page reload
validateForm()              // Check all fields
setLoading(true)            // Show loading UI
Simulate API call (1500ms)  // Delay to show loading
Check credentials
setSuccess(true) | setServerError()
setLoading(false)           // Hide loading UI
```

## Demo Credentials

```
Email:    admin@example.com
Password: password123

Try:
✓ This exact combination → Success
✗ Any other combination → "Invalid email or password"
```

## Import Statements

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusMessage } from '@/components/ui/StatusMessage';

interface FormErrors {
  email?: string;
  password?: string;
}
```

## Accessibility Features

- Input labels with `<label>` elements
- Proper input types (email, password)
- Autocomplete attributes
- Autofocus on email field
- Error messages associated with fields
- Semantic form structure
- ARIA-friendly button states

## Testing Checklist

- [ ] Email validation (required, format)
- [ ] Password validation (required, length)
- [ ] Successful login (admin@example.com / password123)
- [ ] Failed login (invalid credentials)
- [ ] Loading state display
- [ ] Success message display
- [ ] Error message display
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Form submission with Enter key

---

**Status:** Ready for manual browser testing at `http://localhost:3000/login`
