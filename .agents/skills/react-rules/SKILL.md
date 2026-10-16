---
name: react-rules
description: Standards and best practices for building React 19+ applications with TypeScript, Zustand, Zod, React Hook Form, and TanStack Query/SWR. Use this skill whenever the user requests creating a React application or project, creating or modifying React components, custom hooks, state management with Zustand, forms with React Hook Form and Zod validation, API data fetching, or refactoring and applying React best practices.
---

# React Best Practices & Architecture Standards

Guidelines and conventions for developing modern, scalable, and type-safe React applications.

---

## 1. Core Tech Stack & Tooling

- **React Version**: Use **React 19.2.5 or higher** (latest stable release). Refer to the official [React npm package](https://www.npmjs.com/package/react) for version verification.
- **Language**: Use **TypeScript** strictly instead of JavaScript. Enable strict type checking (`strict: true`) to ensure type safety, clean interfaces, and maintainability.
- **Component Style**: Use functional components with explicit TypeScript typings for props and return types (or inferred `React.JSX.Element`).

```tsx
interface UserCardProps {
  name: string;
  email: string;
  onSelect: (email: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ name, email, onSelect }) => {
  return (
    <div className="card" onClick={() => onSelect(email)}>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
};
```

---

## 2. Component Design & Render Purity

- **Single Responsibility**: Keep components small, simple, and focused on a single responsibility.
- **Avoid Over-Complexity**: Split large monolithic components into focused sub-components.
- **Pure Rendering**:
  - Components and custom hooks must remain pure functions of their props and state.
  - Never trigger side effects (DOM mutation, timers, external mutations) directly during render.
  - Side effects belong exclusively inside event handlers or `useEffect` (for external synchronization).
- **Parent-Child Communication**:
  - Pass callback functions via props (`onAction`, `onSelect`, `onChange`) from parent to child.
  - Children invoke these callbacks when relevant state changes occur, avoiding reverse coupling.

---

## 3. State Management Disciplines

### Client State with Zustand
- Use **Zustand** for global application and client-side UI state.
- Create stores with `create()`, defining both the state properties and action functions within the store definition.

```typescript
import { create } from 'zustand';

interface AuthState {
  user: { id: string; email: string; role: string } | null;
  isAuthenticated: boolean;
  login: (user: { id: string; email: string; role: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Server State with React Query or SWR
- Use **TanStack Query (React Query)** or **SWR** for asynchronous server state:
  - Caching and deduplication of API requests.
  - Automatic background re-fetching and synchronization.
  - Error and loading state management.
- Do not store API responses manually in local or global client stores when a dedicated server-state tool fits.

### State Immutability
- **Never mutate state directly**.
- Always return new references when updating state (e.g., using object spread `{ ...prev, key: value }` or array copy methods `[...items, newItem]`, `.map()`, `.filter()`).

### State Reset & Synchronization
- **Component Identity**: Use the React `key` prop on a component to reset its entire internal state when its entity identity changes.
- **Derived State**: Avoid copying props into state. Calculate derived values dynamically during render or in event handlers.

---

## 4. Hook Disciplines & Rules

### Rules of Hooks
- Never call hooks inside loops, conditions, or nested functions.
- Always call hooks at the top level of the React component or custom hook.

### `useEffect` Boundaries
- **Use `useEffect` ONLY for external system synchronization**:
  - Browser APIs (window resize, media queries, local storage events).
  - External non-React libraries (e.g., third-party charting or mapping widgets).
  - WebSockets, EventSources, or manual subscriptions.
- **Do NOT use `useEffect` for**:
  - Calculating derived state (compute directly in the render function).
  - Handling user interactions (handle directly in `onClick`, `onSubmit`, etc. event handlers).
  - Chaining state updates based on other state updates.

### Custom Hooks Extraction
- Encapsulate reusable logic into modular custom hooks (e.g., `useAuth`, `useFetch`, `useWindowSize`).
- Keep UI components strictly focused on presentation, delegating business logic and state management to hooks.

### Performance Optimization
- Use `useMemo` and `useCallback` **only** when there is a measurable performance benefit (e.g., heavy data transformation or avoiding re-renders of memoized child trees with `React.memo`).
- Avoid premature optimization on trivial computations.

---

## 5. Data Validation & Forms

### Zod Validation Schemas
- Use **Zod** as the single source of truth for runtime validation and TypeScript schema inference.
- Define reusable schemas with `z.object()`, `z.string()`, etc., and validate with `safeParse()` or `parse()`.

```typescript
import { z } from 'zod';

export const userRegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(3, "Name must be between 3 and 50 characters").max(50),
});

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
```

### React Hook Form Integration
- Combine **React Hook Form** with Zod via `@hookform/resolvers/zod`:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userRegistrationSchema, UserRegistrationInput } from './schemas';

export const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserRegistrationInput>({
    resolver: zodResolver(userRegistrationSchema),
  });

  const onSubmit = (data: UserRegistrationInput) => {
    // Process form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("fullName")} placeholder="Full Name" />
      {errors.fullName && <span>{errors.fullName.message}</span>}

      <input {...register("email")} type="email" placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("password")} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>Register</button>
    </form>
  );
};
```
