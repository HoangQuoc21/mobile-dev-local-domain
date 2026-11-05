# mobile-dev-local-domain

A lightweight utility package for React Native / mobile applications that resolves the correct local backend URL (`http://10.0.2.2:<port>` on Android Emulator and `http://localhost:<port>` on iOS Simulator) during local development.

## Why?

When developing a mobile app alongside a local backend server on your machine:
- **iOS Simulator** shares the host machine's network stack and can access your local server via `http://localhost:<port>`.
- **Android Emulator** runs inside a virtual router where `localhost` (`127.0.0.1`) points to the emulator itself. To reach the host machine's loopback interface, you must use the special alias `http://10.0.2.2:<port>`.

`mobile-dev-local-domain` automatically detects the mobile platform at bundle time using platform-specific file extensions (`.android` and `.ios`) and returns the appropriate local URL.

## Installation

```bash
npm install mobile-dev-local-domain
# or
yarn add mobile-dev-local-domain
# or
pnpm add mobile-dev-local-domain
```

## Usage

### Get the Local Development Domain

```ts
import { getLocalDevDomain } from "mobile-dev-local-domain";

const PORT = 8080;
const BASE_URL = getLocalDevDomain(PORT);
// Android -> "http://10.0.2.2:8080"
// iOS     -> "http://localhost:8080"
// Other   -> undefined
```

### Platform Helpers

The package also exports platform detection constants resolved by your bundler (e.g. Metro):

```ts
import {
  isAndroid,
  isIOS,
  currentPlatform,
  type AvailableMobilePlatform,
} from "mobile-dev-local-domain";

console.log(currentPlatform); // "android" | "ios" | "other"
console.log(isAndroid);       // true on Android, false otherwise
console.log(isIOS);           // true on iOS, false otherwise
```

## API Reference

### `getLocalDevDomain(port: number): string | undefined`

| Platform | Return Value |
| --- | --- |
| Android (`.android`) | `http://10.0.2.2:${port}` |
| iOS (`.ios`) | `http://localhost:${port}` |
| Other / Fallback | `undefined` |

### Exported Constants & Types

- `isAndroid: boolean` — `true` when bundled for Android, `false` otherwise.
- `isIOS: boolean` — `true` when bundled for iOS, `false` otherwise.
- `currentPlatform: AvailableMobilePlatform` — `"android"`, `"ios"`, or `"other"`.
- `AvailableMobilePlatform` — Type union `"android" | "ios" | "other"`.

## License

MIT
