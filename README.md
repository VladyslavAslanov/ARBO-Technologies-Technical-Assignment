# Tree Feature Collector

Mobile application for collecting and managing tree defect records.
Users can create records with defect type, severity, notes, GPS location, and photos, then filter and browse records efficiently.

**Tech stack:** Expo (React Native) · Expo Router · MobX · NativeWind · Nest.js · i18next, Prisma

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Repository Structure](#repository-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Scripts](#scripts)
8. [Application Architecture](#application-architecture)
   - [Layers](#layers)
   - [Data Flow](#data-flow)
   - [Communication Diagrams](#communication-diagrams)
9. [Navigation (Expo Router)](#navigation-expo-router)
10. [Internationalization (i18n)](#internationalization-i18n)
11. [Filters](#filters)
12. [Create Record Flow](#create-record-flow)
13. [Error Handling](#error-handling)
14. [Known Issues & Technical Debt](#known-issues--technical-debt)
15. [Testing Strategy](#testing-strategy)

## Overview

Tree Feature Collector is a mobile app designed for arborists and field workers to document tree defects.
Each record can include:

- **Defect type**
- **Severity** (1–5)
- **Optional note**
- **GPS coordinates**
- **Photos** (camera or gallery)

The app is built with scalability in mind, with clear separation of UI, state, and services.

## Features

### Implemented

- Records list and record detail
- Create record with:
  - defect type selection
  - severity (1–5)
  - optional note
  - GPS (if available)
  - photos (camera / gallery, multiple selection)
- Delete record
- Filters screen:
  - defect type (multi-select)
  - time period: **7 / 14 / 30 days + All time**
  - sorting (createdAt / severity)
  - order (ASC / DESC)
  - min / max severity
  - reset filters
- Internationalization:
  - Czech (`cs`)
  - English (`en`)
  - language switcher (CZ / EN)
- Light/Dark theme support via NativeWind (currently works only via switching `theme` (light/dark) in `app.json`)

### Not Implemented Yet

- Centralized `apiClient`
- Full API error normalization
- Persistent storage for language/theme/filters
- Offline mode
- E2E tests
- CI/CD pipelines

## Tech Stack

### Mobile

- Expo SDK
- React Native
- TypeScript
- Expo Router (file-based routing)
- MobX + mobx-react-lite
- NativeWind
- i18next + react-i18next

### Backend

- Nest.js
- TypeScript
- Prisma
- SQLite
- OpenAPI (Swagger)
- HTTP API
- REST endpoints for records and defect types

## Repository Structure

Example (simplified):

```
root/
├─ apps/
│  ├─ api/
│  │  ├─ apps/
│  │  │  └─ api/
│  │  │     ├─ data/
│  │  │     ├─ src/
│  │  │     │  └─ records/
│  │  │     │     └─ dto/
│  │  │     │        └─ responses/
│  │  │     └─ uploads/
│  │  ├─ data/
│  │  ├─ dist/
│  │  ├─ prisma/
│  │  │  └─ migrations/
│  │  ├─ src/
│  │  │  ├─ common/
│  │  │  │  ├─ auth/
│  │  │  │  └─ decorators/
│  │  │  ├─ database/
│  │  │  ├─ defect-types/
│  │  │  │  └─ dto/
│  │  │  └─ records/
│  │  │     └─ dto/
│  │  └─ test/
│  └─ mobile/
│     ├─ .expo/
│     ├─ node_modules/
│     └─ src/
│        ├─ app/
│        │  └─ records/
│        ├─ components/
│        │  ├─ DefectTypeDropdown/
│        │  ├─ LanguageToggle/
│        │  ├─ PillButton/
│        │  └─ SingleSelectDropdown/
│        ├─ core/
│        ├─ helpers/
│        ├─ i18n/
│        │  └─ locales/
│        ├─ screens/
│        │  ├─ CreateRecordScreen/
│        │  ├─ FilterScreen/
│        │  ├─ RecordDetailScreen/
│        │  └─ RecordsScreen/
│        ├─ services/
│        └─ stores/
├─ node_modules/
```

## **Getting Started**

### **Prerequisites**

- Node.js (LTS recommended)
- npm
- Xcode / Android Studio
- Expo Go

### **Install dependencies**

```
npm install
```

### **Run the mobile app**

```
npm --workspace=mobile run start
```

### **Clear Metro cache (if needed)**

```
npm --workspace=mobile run start -- --clear
```

### **Run the server**

```
npm --workspace=api run start
```

### **Generate Prisma (if needed)**

```
cd ./apps/api
npm run db:generate
```

## **Environment Variables**

### Mobile app

Create .env in /mobile:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Server

Create .env in /api:

```
DATABASE_URL="file:./apps/api/data/dev.db"
PORT=3000
UPLOAD_DIR="./apps/api/uploads"
```

All variables used at runtime must start with EXPO*PUBLIC*.

## **Scripts**

Common scripts:

- start — run Expo dev server
- lint — lint code (if configured)

## **Application Architecture**

### **Layers**

**UI Layer**

- Screens and reusable components
- Minimal business logic
- **State Layer**
- MobX stores:
  - sessionStore
  - recordsStore
  - defectTypesStore
  - languageStore
  - themeStore (optional)

**Services**

- Location service
- Image utilities
- (Future) API client

**Helpers**

- Error parsing
- Permissions
- Image normalization

### **Data Flow**

1.  UI reads observable state from stores
2.  UI calls store actions
3.  Store updates observable state (inside actions)
4.  UI reacts automatically

### **Communication Diagrams**

#### **App Startup**

```
UI (_layout)
  ↓
rootStore init
  ↓
sessionStore.init → deviceId
  ↓
defectTypesStore.load(deviceId)
```

#### **Create Record**

```
CreateRecordScreen
  ↓
getCurrentLocation()
  ↓
normalize photos (JPEG + size check)
  ↓
POST /api/records
  ↓
recordsStore.loadFirstPage()
```

## **Navigation (Expo Router)**

Routes are defined in src/app.

**Examples:**

- index.tsx — records list
- create.tsx — create record
- record/[id].tsx — record detail
- filters.tsx — filters screen

**Important:** every route file must have a default export.

## **Internationalization (i18n)**

- i18next + react-i18next
- Namespaces:
  - common
  - screens
  - defects
- Languages:
  - cs
  - en

Language switcher updates i18n state and store.
Missing improvement: persist selected language between app launches.

## **Filters**

Filters screen supports:

- defect types (multi-select)
- period:
  - 7 / 14 / 30 days
  - All time (days = null)
- sorting & order
- severity range
- reset

## **Create Record Flow**

### **Constraints**

- minimum 1 photo
- maximum 10 photos
- maximum 5 MB per photo (after conversion)
- JPEG normalization

### **Improvements needed**

- per-photo error handling
- progress indicator during photo processing
- preview full-size photos

## **Error Handling**

### **Current**

- fetch calls in multiple places
- parseApiErrorMessage for basic parsing

### **Recommended**

Central apiClient:

- base URL
- headers
- timeout
- unified error format
  Example error shape:

```
type ApiError = {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
};
```

---

### **Implemented Validation:**

- required fields: deviceId, defectType, photos
- photo count and size limits

---

### **Missing / Recommended Validation:**

- note length limits
- minSeverity ≤ maxSeverity enforcement
- partial photo failure handling
- better permission error UX
- stronger backend validation mapping

---

### **Known Issues & Technical Debt**

- No centralized API layer
- MobX strict-mode warnings if actions are missed
- No persistence for language/theme
- No automated tests
- No offline support

---

### **Testing Strategy**

Recommended order:

1.  API client unit tests
2.  Store logic tests
3.  Component tests (React Native Testing Library)
4.  E2E tests (Detox)

---

### Future Improvements – High ROI:

1.  Central apiClient
2.  Strict MobX actions everywhere
3.  Persist settings (language/theme/filters)
4.  Apply/Reset filters UX
5.  Tests + CI

---

### **Troubleshooting – Styles not applied**

- Check tailwind.config.js content paths
- Ensure darkMode: "class"
- Clear Metro cache

---

### Guidelines:

- no business logic in UI
- no raw strings in UI (use i18n)
- no direct fetch in screens
- consistent commit messages

---

### Commit message examples:

- feat(i18n): add EN translations and language toggle
- feat(filters): add all-time period option
- refactor(store): enforce MobX actions
