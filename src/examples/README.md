# Hook Usage Examples

This directory contains examples of how to use the API hooks in your React components.

## Available Examples

1. **AuthExample.tsx** - Authentication flow
2. **UsersListExample.tsx** - Users listing with pagination
3. **ProfileUpdateExample.tsx** - Profile editing
4. **FileUploadExample.tsx** - File upload with progress

## Quick Start

```tsx
import { useAuth, useUsers } from '../hooks';

function MyComponent() {
  const { user, login, isAuthenticated } = useAuth();
  const { data: users, loading } = useUsers();
  
  // Your component logic here
}
```

## Import Patterns

```tsx
// Import specific hooks
import { useAuth, useUsers } from '../hooks';

// Import types
import type { User, LoginData } from '../hooks';

// Import API client directly
import { apiClient } from '../hooks';
```
