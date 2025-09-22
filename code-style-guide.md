# Code Style Guide

## General Principles

- Write code that is easy to understand and maintain
- Keep functions and components focused on a single responsibility
- Prioritize readability over clever solutions
- Follow the DRY (Don't Repeat Yourself) principle

## Naming Conventions

### Functions

- ❌ Avoid using "handle" prefix for event handlers
  - Bad: `handleSubmit`, `handleClick`, `handleChange`
  - Good: `onSubmit`, `onClick`, `onChange`
- Use action verbs for function names
  - Good: `createUser`, `validateInput`, `fetchData`
- Use camelCase for function names
  - Good: `calculateTotal`, `fetchUserData`

### Variables

- Use descriptive, meaningful names
- ❌ Avoid single-letter variables (except for loops)
- Use camelCase for variables
  - Good: `userEmail`, `isLoading`, `cartItems`
- Use boolean prefixes: `is`, `has`, `should`
  - Good: `isActive`, `hasPermission`, `shouldUpdate`

### Components

- Use PascalCase for component names
- Use suffixes to indicate component type
  - Good: `UserCard`, `ProductList`, `AuthProvider`

### Files

- Use camelCase for file names
  - Good: `authProvider.ts`, `productCard.tsx`
- Group related files in descriptive folders

## TypeScript Guidelines

### Types and Interfaces

- Use interfaces for object definitions
- Use type for unions, intersections, and primitives
- Define reusable types in separate files

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: UserRole;
}

type UserRole = "admin" | "user";
```

### Type Assertions

- Avoid using `any`
- Use type assertions only when necessary
- Prefer type guards over assertions

## React Components

### Component Structure

```typescript
// Good component structure
const ComponentName = () => {
  // 1. Hooks
  const { data } = useQuery();
  const [state, setState] = useState();

  // 2. Derived state
  const computedValue = useMemo(() => {...}, []);

  // 3. Event handlers
  const onSubmit = () => {...};

  // 4. Helper functions
  const formatData = () => {...};

  // 5. Render
  return (...);
};
```

### State Management

- Keep state as local as possible
- Use appropriate state management tools
  - Local state: `useState`
  - Complex state: `useReducer`
  - Global state: Context or state management library

### Props

- Define prop types explicitly
- Use destructuring for props

```typescript
// Good
interface Props {
  title: string;
  onAction: () => void;
}

const Component = ({ title, onAction }: Props) => {...};
```

## Material-UI Guidelines

### Styling

- Use `styled` components for custom styling
- Follow theme structure for colors and spacing
- Use MUI's built-in spacing units
- ❌ Avoid using `!important` unless absolutely necessary
- ❌ Avoid inline `sx` prop or `style` prop for reusable components
  - Bad: `<Box sx={{ padding: 2, margin: 1 }}>`
  - Bad: `<div style={{ padding: '16px' }}>`
  - Good: Use styled components for consistent, reusable styling

```typescript
// Good
const StyledComponent = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1, 2),
}));

// Only use sx for one-off styling needs or small adjustments
// Bad
const ReusableCard = () => (
  <Box sx={{
    padding: 2,
    margin: 1,
    borderRadius: 1
  }}>
    <Typography>Content</Typography>
  </Box>
);

// Good
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius
}));

const ReusableCard = () => (
  <StyledCard>
    <Typography>Content</Typography>
  </StyledCard>
);
```

### Theme

- Use theme variables for colors
- Define custom theme extensions properly
- Use semantic color names

## API and Data Handling

### API Calls

- Use descriptive function names for API calls
- Handle errors properly
- Include proper typing for responses

```typescript
// Good
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};
```

### Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages
- Log errors appropriately

## Testing

### Component Tests

- Test component behavior, not implementation
- Use meaningful test descriptions
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
// Good
describe('Component', () => {
  it('should display error message when validation fails', () => {
    // Arrange
    render(<Component />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
```

## Git Commits

### Commit Messages

- Use conventional commits format
- Write descriptive messages
- Reference issues when applicable

```
feat: add user authentication
fix: resolve login form validation
docs: update API documentation
```

## Performance

### Optimization

- Use React.memo for expensive renders
- Implement proper dependency arrays in hooks
- Avoid unnecessary re-renders
- Use proper key props in lists

## Accessibility

### Guidelines

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper color contrast

## Code Comments

### When to Comment

- Explain complex business logic
- Document non-obvious solutions
- Add TODO comments for future improvements

```typescript
// Good
// Calculate total with tax and shipping based on user's region
const calculateTotal = (subtotal: number, region: string) => {...};
```

---

Note: This style guide is a living document and should be updated as new patterns and best practices emerge.
