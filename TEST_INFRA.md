# E2E Test Infra: Aria-CoTeacher

## Test Philosophy
- Opaque-box, requirement-driven.
- Automated validation via Next.js compiler, TypeScript compiler (`tsc`), ESLint validator, and Jest test runner.
- Zero-tolerance verification for compilation, type checking, and ESLint rule enforcement.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Production Next.js Compilation | ORIGINAL_REQUEST | ✓ | ✓ | ✓ |
| 2 | TypeScript Type Safety | ORIGINAL_REQUEST | ✓ | ✓ | ✓ |
| 3 | ESLint Zero-Error Compliance | ORIGINAL_REQUEST | ✓ | ✓ | ✓ |
| 4 | Jest Unit Test Execution | ORIGINAL_REQUEST | ✓ | ✓ | ✓ |
| 5 | ARIA Co-Teacher Integration Safety | ORIGINAL_REQUEST | ✓ | ✓ | ✓ |
| 6 | Agora Meeting Room UI Stability | ORIGINAL_REQUEST | ✓ | ✓ | ✓ |

## Test Architecture
- **Type Checker**: `npx tsc --noEmit` (exit code 0, 0 type errors)
- **Linter**: `npm run lint` (exit code 0, 0 errors, 0 warnings)
- **Unit & Integration Suite**: `npx jest` / `npm test` (exit code 0, all suites pass)
- **Production Build**: `npm run build` (exit code 0, static/dynamic routes generated cleanly)
