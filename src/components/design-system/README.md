# Design System

## Overview

This design system provides a unified, consistent foundation for building UI components across the application. It follows atomic design principles and includes design tokens, base components, and composition patterns.

## Architecture

```
src/components/design-system/
├── index.ts              # Main export hub
├── tokens.ts             # Design tokens (colors, typography, spacing)
├── types.ts              # TypeScript definitions
├── utils.ts              # Utility functions
├── base/                 # Atomic components
│   ├── Box.tsx
│   ├── Text.tsx
│   ├── Heading.tsx
│   ├── Button.tsx
│   └── ...
└── patterns/             # Composition patterns
    ├── Stack.tsx
    ├── Grid.tsx
    ├── Container.tsx
    └── ...
```

## Design Principles

### 1. Consistency
- All components follow the same patterns and use shared tokens
- Consistent naming conventions and API design
- Predictable behavior across all components

### 2. Accessibility
- WCAG 2.1 AA compliance by default
- Proper semantic markup
- Keyboard navigation support
- Screen reader optimization

### 3. Performance
- Tree-shakable exports
- Optimized CSS-in-JS with CVA
- Responsive design with mobile-first approach
- Minimal runtime overhead

### 4. Flexibility
- Composable components
- Extensive customization options
- Support for design system extensions
- Framework-agnostic tokens

## Usage

### Basic Import
```tsx
import { Button, Text, Stack } from '@/components/design-system';
```

### Design Tokens
```tsx
import { colors, spacing, typography } from '@/components/design-system/tokens';

// Use in custom components
const CustomComponent = styled.div`
  color: ${colors.primary.DEFAULT};
  margin: ${spacing[4]};
  font-size: ${typography.fontSize.lg};
`;
```

### Base Components
```tsx
import { Box, Text, Button } from '@/components/design-system/base';

function Example() {
  return (
    <Box padding={4}>
      <Text size="lg" weight="semibold">
        Welcome to our design system
      </Text>
      <Button variant="primary" size="lg">
        Get Started
      </Button>
    </Box>
  );
}
```

### Composition Patterns
```tsx
import { Stack, Container } from '@/components/design-system/patterns';

function Layout() {
  return (
    <Container>
      <Stack gap={6} align="center">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </Stack>
    </Container>
  );
}
```

## Component Guidelines

### Naming Conventions
- Use PascalCase for component names
- Use descriptive, semantic names
- Avoid abbreviations unless widely understood

### Props API
- Extend appropriate HTML element props
- Use consistent prop naming across components
- Provide sensible defaults
- Support responsive values where appropriate

### Variants
- Use semantic variant names (e.g., 'primary', 'destructive')
- Keep variant sets consistent across similar components
- Document all available variants

### Responsive Design
```tsx
// Responsive props support
<Stack 
  direction={{ default: 'column', md: 'row' }}
  gap={{ default: 4, lg: 8 }}
>
  Content
</Stack>
```

## Theme Customization

### CSS Custom Properties
The design system uses CSS custom properties for dynamic theming:

```css
:root {
  --primary: 275 100% 75%;
  --primary-foreground: 0 0% 100%;
  /* ... */
}

.dark {
  --primary: 275 100% 80%;
  /* ... */
}
```

### Component Variants
Extend existing components with new variants:

```tsx
import { buttonVariants } from '@/components/design-system/base/Button';

const customButtonVariants = cva('', {
  extends: buttonVariants,
  variants: {
    variant: {
      ...buttonVariants.variants.variant,
      custom: 'bg-custom text-custom-foreground',
    },
  },
});
```

## Best Practices

### Do's
✅ Use design tokens instead of hardcoded values
✅ Compose complex components from base components
✅ Follow the established naming conventions
✅ Test components with keyboard navigation
✅ Provide meaningful prop documentation

### Don'ts
❌ Create one-off styling in components
❌ Use hardcoded colors, spacing, or typography
❌ Override component styles with !important
❌ Ignore accessibility guidelines
❌ Create components without proper TypeScript types

## Testing

### Component Testing
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/design-system';

test('renders button with correct variant', () => {
  render(<Button variant="primary">Click me</Button>);
  expect(screen.getByRole('button')).toHaveClass('bg-primary');
});
```

### Visual Testing
- Use Storybook for component documentation and testing
- Include all variants and states in stories
- Test responsive behavior
- Verify accessibility with axe-core

## Migration Guide

### From Legacy Components
1. Identify equivalent design system components
2. Update import statements
3. Replace custom styling with design tokens
4. Update prop names to match new API
5. Test functionality and visual appearance

### Breaking Changes
- Component prop renames are documented in CHANGELOG.md
- Use codemods when available for automated migration
- Deprecated components will show console warnings

## Contributing

### Adding New Components
1. Follow the established patterns in `/base` or `/patterns`
2. Use design tokens for all styling
3. Include comprehensive TypeScript types
4. Add Storybook stories
5. Write unit tests
6. Update this documentation

### Updating Tokens
1. Ensure backward compatibility when possible
2. Update documentation
3. Test across all components
4. Consider dark mode implications

## Resources

- [CVA Documentation](https://cva.style)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)