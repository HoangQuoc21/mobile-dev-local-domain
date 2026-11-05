# Developer Guide: Creating & Publishing a TypeScript NPM Package

This document serves as a step-by-step reference for initializing, configuring, building, and publishing a lightweight TypeScript package (including React Native platform-specific files).

---

## 1. Initialize the Project

```bash
# 1. Create a new repository / folder and initialize npm
npm init -y

# 2. Install TypeScript and Node types as dev dependencies
npm install typescript @types/node --save-dev

# 3. Generate a tsconfig.json file
npx tsc --init
```

---

## 2. Configure `.gitignore`

Create a `.gitignore` file to exclude dependencies and build artifacts from Git:

```gitignore
node_modules
dist
*.tgz
```

---

## 3. Configure `tsconfig.json`

Key settings to update in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    // 1. Define source and output directories
    "rootDir": "./src",
    "outDir": "./dist",

    // 2. Module & target settings (best for bundlers like Metro, Vite, Webpack)
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "esnext",
    "types": [],

    // 3. Emit declaration (.d.ts) and source map files for consumers
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // 4. Strictness & safety
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
  },
}
```

### Why `"module": "esnext"` and `"moduleResolution": "bundler"`?

- By default, `tsc --init` may set `"module": "nodenext"`, which enforces Node.js native ESM rules requiring explicit `.js` extensions in relative imports (`import ... from "./file.js"`).
- For packages consumed by bundlers (like **Metro** in React Native), `"module": "esnext"` with `"moduleResolution": "bundler"` allows clean extensionless imports (`import ... from "./getPlatform"`), which is required so Metro can resolve platform-specific files (`getPlatform.android.js`, `getPlatform.ios.js`).
- If `"verbatimModuleSyntax": true` is enabled, TypeScript forces type imports to use `import type { ... }`. Commenting it out or using `import type` prevents build errors.

---

## 4. Configure `package.json`

Make sure `package.json` includes the entry points, included files, and build scripts:

```json
{
  "name": "mobile-dev-local-domain",
  "version": "1.0.0",
  "description": "A package to get local domain when developing both mobile and backend source codes.",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

### Key Fields Explained

- `"main"`: Entry point for JavaScript runtime (`./dist/index.js`).
- `"types"`: Entry point for TypeScript type definitions (`./dist/index.d.ts`).
- `"files": ["dist"]`: Ensures only the compiled `dist/` folder (along with `README.md` and `package.json`) is uploaded when publishing to npm, keeping the package size minimal.
- `"prepublishOnly": "npm run build"`: Automatically runs `tsc` right before `npm publish` so you never publish stale or missing build files.

---

## 5. Writing Platform-Specific Files (React Native / Metro Pattern)

When writing code that differs between Android and iOS without importing `react-native` directly:

1. **`src/getPlatform.ts` (Fallback & TypeScript source of truth)**
   TypeScript uses this file during compilation and type-checking. Always provide default fallback values (instead of `declare`) so non-mobile environments (Web, Node, Jest) don't crash at runtime:

   ```ts
   export type AvailableMobilePlatform = "android" | "ios" | "other";

   export const isAndroid: boolean = false;
   export const isIOS: boolean = false;
   export const currentPlatform: AvailableMobilePlatform = "other";
   ```

2. **`src/getPlatform.android.ts` & `src/getPlatform.ios.ts`**
   Metro automatically prioritizes `.android.js` on Android and `.ios.js` on iOS when resolving `import { ... } from "./getPlatform"`.

---

## 6. Build, Test Locally, and Publish

### Build the package

```bash
npm run build
```

Verify that the `dist/` directory contains `.js`, `.d.ts`, and `.map` files.

### Preview what will be published

```bash
npm pack --dry-run
```

This lists every file that will be included in the npm tarball.

> **Note:** Do not name internal developer notes `README.*.md` (e.g., `README.dev.md`) in the root directory, because npm automatically includes any root file starting with `README` in the published tarball. Name it `DEVELOPMENT.md` instead.

### Test Locally in a React Native Project (Before Publishing)

Because React Native's **Metro bundler** does not follow symlinks outside the project root by default, avoid `npm link` / `bun link`. Instead, pack the library into a `.tgz` archive and install it directly in your React Native app:

#### Step 1: Create the `.tgz` tarball in this package directory

```bash
npm run build
npm pack
# Produces: mobile-dev-local-domain-1.0.0.tgz
```

#### Step 2: Install the `.tgz` file in your React Native project

Run the command below inside your React Native project directory:

```bash
# Using Bun:
bun add /absolute/path/to/mobile-dev-local-domain/mobile-dev-local-domain-1.0.0.tgz

# Using npm:
npm install /absolute/path/to/mobile-dev-local-domain/mobile-dev-local-domain-1.0.0.tgz

# Using Yarn:
yarn add /absolute/path/to/mobile-dev-local-domain/mobile-dev-local-domain-1.0.0.tgz

# Using pnpm:
pnpm add /absolute/path/to/mobile-dev-local-domain/mobile-dev-local-domain-1.0.0.tgz

# Using bun:
bun add /absolute/path/to/mobile-dev-local-domain/mobile-dev-local-domain-1.0.0.tgz
```

_(Tip: If you rebuild and re-pack the `.tgz` with the same version `1.0.0` while using Bun, run `bun add --no-cache /absolute/path/to/mobile-dev-local-domain-1.0.0.tgz` so Bun doesn't use its cached tarball)._

#### Step 3: Import & test in your React Native code

```ts
import { getLocalDevDomain, currentPlatform } from "mobile-dev-local-domain";

console.log("Platform:", currentPlatform);
console.log("Local domain:", getLocalDevDomain(8080));
```

If Metro was already running before installing the package, restart Metro with cache cleared (`npx react-native start --reset-cache` or `npx expo start -c`).

#### Step 4: Clean up after testing

```bash
# In this package repo, remove the generated tarball
rm mobile-dev-local-domain-1.0.0.tgz

# In your React Native project, remove the local tarball or replace it once published
bun remove mobile-dev-local-domain
```

### Publish to npm

```bash
# 1. Log in to your npm account (if not already logged in)
npm login

# 2. Publish the package
npm publish

# (If publishing a scoped public package like @username/pkg-name)
npm publish --access public
```

### Releasing a new version later

```bash
# Bump version (patch: 1.0.x, minor: 1.x.0, major: x.0.0)
npm version patch

# Publish the updated version
npm publish
```
