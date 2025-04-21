---

```md
# ⚙️ Vite + React + TypeScript — Pro Error Handling Boilerplate

This is a **production-ready frontend boilerplate** built with **Vite**, **React 18**, and **TypeScript**, designed to demonstrate **enterprise-level error handling patterns** under the concept of _“Pro Patterns Master Devs Should Know.”_

> Designed for teams and developers who value **robust error boundaries**, **structured logging**, and **scalable architecture**.

---

## 🚀 Features & Concepts Covered

### ✅ Centralized Error Handling
- All errors are processed via a central `ErrorManager` utility that standardizes messages and error types.
- Helps avoid scattered `try/catch` logic.

### ✅ Custom Error Classes
- Easily extendable classes like `NetworkError`, `AuthError`, and `ValidationError` provide better type safety and flow control.

### ✅ Global Error Boundaries
- A reusable `<ErrorBoundary>` React component captures render errors and displays fallback UI.

### ✅ Async Global Error Hooks
- Handles unhandled promise rejections and global JS errors via `window.onerror` and `onunhandledrejection`.

### ✅ UI-Level Error-First UX
- Includes user feedback mechanisms:
  - Skeletons for loading
  - Retry buttons for recoverable errors
  - Toasts and redirect logic for known error categories

### ✅ Error Middleware / Decorator
- API and business logic are wrapped with reusable error-handling decorators that reduce boilerplate.

### ✅ Feature Flags (Mocked)
- A mock feature flag system is integrated to allow toggling of new features without redeploying.

### ✅ Global State for Errors (Zustand)
- Centralized error state and toasts powered by Zustand.

### ✅ Monitoring-Ready
- Includes a simulated `logErrorToService()` function to show how to hook into monitoring tools like Sentry.

---

## 🧱 Folder Structure

```
src/
├── components/         # Reusable UI components
├── pages/              # Page-level components
├── services/           # API and async logic
├── errors/             # Error classes & manager
├── hooks/              # Custom hooks
├── utils/              # General utilities
├── stores/             # Zustand store (error state)
├── featureFlags.ts     # Feature toggle system
└── App.tsx             # Main app with boundaries
```

---

## 🛠️ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

### 3. Run the linter (optional)

```bash
npm run lint
```

---

## 🔍 Example: Handling API Error

```ts
try {
  const data = await fetchUser();
} catch (err) {
  const { message, type } = ErrorManager.handle(err);

  if (type === "auth") navigate("/login");
  else showToast(message);
}
```

---

## 📦 Built With

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zustand](https://github.com/pmndrs/zustand) — for global error state

---

## 📄 License

MIT — feel free to fork and customize!

---
