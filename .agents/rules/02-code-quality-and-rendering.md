---
name: code-quality-and-rendering
description: Enforce production-grade React rendering patterns, clean TypeScript standards, strict error handling, and formatting rules.
trigger: always_on
---

# Rule: Code Quality & Production-Grade Rendering

## 1. Punctuation & Typography Constraint
- **No Em-Dashes**: Never use the em-dash character (`\u2014` or `—`). Always use a standard hyphen/dash (`-`).

## 2. Production-Grade Rendering Patterns
- **No Messy Rendering Conditions**: Avoid deeply nested ternary expressions, unchecked falsy guards (e.g. `count && <Component />` rendering `0`), or inline complex logic inside JSX.
- **Pattern Matching & Lookup Tables**: For rendering variant-specific or node-type-specific components, use explicit dictionary mappings, registry lookups, or dedicated sub-components.
- **Early Return Guards**: Handle loading, empty, and error states with clear early returns at the top of components rather than wrapping entire JSX trees in ternaries.
- **Safe Fallbacks**: Always provide explicit fallback UI or default token values for nullable or optional metadata.

### Bad Example:
```tsx
// Anti-pattern: Nested ternaries, unsafe falsy condition
return (
  <div>
    {isLoading ? <Spinner /> : error ? <ErrorDisplay message={error} /> : items.length && items.map(item => (
      item.type === 'database' ? <DbNode {...item} /> : item.type === 'cache' ? <CacheNode {...item} /> : <DefaultNode {...item} />
    ))}
  </div>
);
```

### Good Example:
```tsx
// Production-grade pattern: Early returns, registry lookup, clear branching
if (isLoading) {
  return <Spinner />;
}

if (error) {
  return <ErrorDisplay message={error} />;
}

if (items.length === 0) {
  return <EmptyState message="No nodes found" />;
}

return (
  <div className="diagram-container">
    {items.map((item) => {
      const NodeComponent = nodeComponentRegistry[item.type] ?? DefaultNode;
      return <NodeComponent key={item.id} node={item} />;
    })}
  </div>
);
```

## 3. Strict TypeScript Standards
- **Explicit Types**: Do not use `any`. Use generic parameters, discriminated unions, and Zod-inferred types (`z.infer<typeof Schema>`).
- **Discriminated Unions**: For polymorphism (e.g., `DiagramNode`, `DiagramAnnotation`, `DiagramCommand`), use explicit `type` tags.
- **Exhaustive Type Checking**: Use `never` guards in `switch` statements to guarantee complete handling of all union members.

```ts
function assertUnreachable(x: never): never {
  throw new Error(`Unhandled union variant: ${JSON.stringify(x)}`);
}
```

## 4. Immutable State Updates
- Treat `DiagramDocument` and state objects as immutable structures.
- Use explicit command handlers or Immer for deep mutations, avoiding direct object property mutation.
