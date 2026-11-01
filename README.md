# Eduvanta Desktop — Institutional Academic & ERP Management Suite 🎓

[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-blue.svg?logo=tauri)](https://v2.tauri.app/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![SourceForge](https://img.shields.io/badge/SourceForge-Eduvanta-orange.svg)](https://sourceforge.net/projects/eduvanta/)

**Eduvanta Desktop** is a modern, cross-platform academic and institutional enterprise desktop application built with **Tauri 2**, **Rust**, **React 19**, and **TypeScript**. Designed for universities, polytechnics, and institutes, Eduvanta provides an end-to-end administration portal for curriculum planning, faculty directory management, student admissions processing, fee billing, and institutional media assets.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Features & Modules](#-key-features--modules)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Build & Packaging](#-build--packaging)
  - [Frontend Production Build](#frontend-production-build)
  - [Native Desktop Distribution (Tauri 2)](#native-desktop-distribution-tauri-2)
  - [Linux Flatpak & Flathub Packaging](#linux-flatpak--flathub-packaging)
  - [macOS DMG Automated GitHub Actions Workflow](#macos-dmg-automated-github-actions-workflow)
- [Project Directory Structure](#-project-directory-structure)
- [API Integration & State Architecture](#-api-integration--state-architecture)
- [License](#-license)

---

## 🏛️ Architectural Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Eduvanta Desktop                       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                 React 19 Frontend                   │   │
│   │  • TailwindCSS 4  • Zustand Stores  • React Hook    │   │
│   │  • Lucide Icons   • TanStack Query  • Zod Validate  │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │ IPC / HTTP / WSS             │
│   ┌──────────────────────────┴──────────────────────────┐   │
│   │               Tauri 2 Core (Rust)                   │   │
│   │  • Native Windowing   • File Access Portal          │   │
│   │  • WebKitGTK / WebView2 / WebKit Engine             │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │ REST API & WebSockets
                               ▼
            ┌────────────────────────────────────┐
            │       CIITM Express Backend        │
            │  MongoDB • RabbitMQ • Cloudinary   │
            └────────────────────────────────────┘
```

- **Tauri 2 Core (`src-tauri`)**: Lean native Rust shell providing secure system integrations, file dialogs, notification dispatching, and cross-platform native bundles.
- **Modern React 19 Frontend (`src`)**: High-performance UI utilizing Vite 7 client compilation, TailwindCSS styling, and strongly typed component design.
- **Resilient Network Layer (`src/Utils/api.utils.ts`)**: Pre-configured Axios instance with automatic bearer token injection, uniform error message extraction, and timeout resilience.

---

## ✨ Key Features & Modules

### 1. Curriculum & Course Management
- **Course Catalog**: Filter and browse active programs across Engineering, IT, Commerce, and Sciences.
- **Course Creation & Validation**: Robust form powered by React Hook Form and Zod schemas, supporting dynamic Admission Criteria lists, Required Documents, and duration specs.
- **Course Banner Artwork**: Live file upload to backend with Cloudinary asset fallback.
- **Resilient Edit & Deletion**: In-place modal editor ([EditCourseModal.tsx](src/features/Course/v1/components/EditCourseModal.tsx)) with dual-payload support (standard multipart `FormData` for banner changes and clean JSON for metadata updates), fallback endpoints (`PUT /api/v1/admin/course/:id/update`, `PUT /api/v1/admin/course/update/:id`), and optimistic Zustand store synchronization.

### 2. Faculty & Teacher Directory
- **Faculty Records**: Directory of academic professors, lecturers, and department leads.
- **Direct Photo Upload**: Native file selector with instant image preview, supporting both multipart `Avtar` file uploads and direct image URL fallback.
- **Zod Schema Validation**: Form fields strictly validated using [Teacher.Validate.ts](src/features/teacher/v1/Validations/Teacher.Validate.ts), ensuring required faculty details (name, email, department, designation, qualification, experience).
- **Social Media Link Normalization**: Full UI inputs for Instagram, LinkedIn, Facebook, and Twitter/X with smart URI auto-completion (automatically prepending `https://` and substituting valid institutional fallback URLs when empty or `#` to guarantee backend schema compatibility).
- **Faculty Induction & Update**: Seamless creation and updating synced directly to `/api/v1/admin/teacher/create` and `/api/v1/admin/teacher/:id/update` with immediate optimistic store updates.

### 3. Student Admissions & Enrollment
- **Admissions Ledger**: Track pending, approved, and rejected candidate registrations.
- **Direct Candidate Enrollment**: Register candidates with course selection, semester allocation, and personal information.
- **Application Dossier Review**: Deep modal view for inspecting candidate records, with one-click status transitions and automated verification email dispatch.

### 4. Student Directory & Profiles
- **Academic Directory**: Filter students by enrolled course and current semester.
- **Detailed Student Dossier**: View student registration data, contact channels, parent info, and academic credentials.
- **Academic Promotion & Demotion**: In-app modal controls ([PromoteModal.tsx](src/features/Student/v1/Components/PromoteModal.tsx)) to promote or adjust student academic semesters (`/api/v1/Student/promote`, `/api/v1/Student/demote`), instantly triggering RabbitMQ queue events with automated HTML email dispatch via Nodemailer.
- **Student Email Notification Dispatch**: Comprehensive modal ([SendNotificationModal.tsx](src/features/Student/v1/Components/SendNotificationModal.tsx)) with one-click Quick Templates (Fee Due, Exam Schedule, Academic Standing, Campus Notice), priority classification (Urgent, Normal, Advisory), and asynchronous background delivery.

### 5. Tuition Fees & Billing
- **Account Ledger**: Search candidates by Unique ID (`EDNORA_...`) to inspect fee breakdowns and payment history.
- **Fee Payment Processing**: Record payment installments and update student balance records via `/api/v1/Student/FeeUpdate`.

### 6. Campus Media & Notice Board
- **Campus Gallery**: Group photographs into thematic albums (Conferences, Convocation, Hackathons).
- **Notices & Circulars**: Publish institutional announcements with priority tags and download links.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Desktop Shell** | [Tauri 2.0](https://v2.tauri.app/) | Secure, lightweight native Rust framework |
| **Language** | Rust 1.80+ / TypeScript 5.6 | Strict type safety across client and shell |
| **Frontend Framework** | [React 19](https://react.dev/) | Modern concurrent UI architecture |
| **Build Tool** | [Vite 7.3](https://vitejs.dev/) | Lightning fast HMR and optimized bundler |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first responsive design |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight, decoupled global stores |
| **Forms & Validation** | React Hook Form + [Zod](https://zod.dev/) | Schema-driven form validation |
| **Icons & UI** | [Lucide React](https://lucide.dev/) / React Icons | Clean FreeDesktop & modern SVG iconography |
| **Notifications** | [React Toastify](https://fkhadra.github.io/react-toastify/) | Dark-mode feedback alerts |

---

## 📦 Prerequisites

Ensure the following runtimes and system libraries are installed:

- **Node.js**: `v20.x` or `v22.x` (or `v24.x`)
- **Package Manager**: `npm` (v10+ or v11+) or `pnpm`
- **Rust Toolchain**: `rustc` and `cargo` (v1.80+)
- **Linux System Libraries** (Debian / Ubuntu / Parrot OS):
  ```bash
  sudo apt-get update && sudo apt-get install -y \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libwebkit2gtk-4.1-dev
  ```

---

## ⚙️ Environment Configuration

Eduvanta Desktop relies on environment variables defined in `.env`:

```bash
cp .env.example .env
```

### Environment Variables Reference

| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the CIITM backend server | `https://ciitm-backend.onrender.com` |
| `VITE_SOCKET_URL` | WebSocket server URL for live events | `https://ciitm-backend.onrender.com` |
| `VITE_ADMIN_TOKEN` | Default/fallback administrator JWT token | *(Set your JWT token)* |
| `VITE_TEST_ADMIN_EMAIL` | Default administrator login email | `admin@gmail.com` |
| `VITE_TEST_ADMIN_PASSWORD` | Default administrator login password | `Admin@123` |

---

## 🚀 Getting Started & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Frontend Dev Server (Web-only)
```bash
npm run dev
```
The browser view is accessible at `http://localhost:1420`.

### 3. Launch with Tauri Desktop Engine
```bash
npm run tauri:dev
```
This launches the native desktop window with hot reload enabled for both React and Rust code.

---

## 📦 Build & Packaging

### Frontend Production Build
To verify TypeScript definitions and compile the production bundle:
```bash
npm run build
```
Compiled static assets are placed in `dist/`.

### Native Desktop Distribution (Tauri 2)
To generate native Linux packages (`.deb`, `.AppImage`):
```bash
npm run tauri:build
```
Output bundles will be generated under `src-tauri/target/release/bundle/`.

---

### 🐧 Linux Flatpak & Flathub Packaging

Eduvanta includes complete packaging specifications for public distribution on **Flathub** under Application ID `com.eduvanta.desktop`.

The `flatpak/` directory contains:
- `com.eduvanta.desktop.yml`: The official Flatpak manifest based on `org.gnome.Platform 47`.
- `com.eduvanta.desktop.metainfo.xml`: AppStream catalog specification with OARS 1.1 content ratings.
- `com.eduvanta.desktop.desktop`: FreeDesktop application launcher entry.
- `icons/`: Hicolor PNG icons (`32x32`, `64x64`, `128x128`, `256x256`, `512x512`).
- `build-flatpak.sh`: Local build and validation helper script.

#### Validate Metadata Files Offline:
```bash
# Validate desktop file
desktop-file-validate flatpak/com.eduvanta.desktop.desktop

# Validate AppStream metainfo
appstreamcli validate --no-net flatpak/com.eduvanta.desktop.metainfo.xml
```

#### Build Flatpak Locally:
```bash
# 1. Install flatpak-builder (Parrot OS / Debian)
sudo apt-get update && sudo apt-get install -y flatpak-builder

# 2. Run the build helper
./flatpak/build-flatpak.sh

# 3. Install and run the bundle locally
flatpak install --user --bundle eduvanta-x86_64.flatpak
flatpak run com.eduvanta.desktop
```

*For complete Flathub PR submission guidelines, refer to [flatpak/README.md](flatpak/README.md).*

---

### 🍏 macOS DMG Automated GitHub Actions Workflow

You can build macOS `.dmg` and `.app` bundles from Linux using GitHub Actions runners without requiring a physical Mac.

The automated workflow is located at:
[`.github/workflows/build-macos.yml`](.github/workflows/build-macos.yml)

#### Triggering the Workflow:
1. Navigate to **GitHub Actions** in your repository.
2. Select the **Build Eduvanta Desktop for macOS** workflow.
3. Click **Run workflow** (or push a git release tag `v*.*.*`).
4. Once completed, download the `.dmg` installer directly from GitHub Actions artifacts or releases.

---

## 📂 Project Directory Structure

```
ciitm-desktop/
├── .github/
│   └── workflows/
│       └── build-macos.yml          # GitHub Actions macOS DMG build runner
├── flatpak/
│   ├── build-flatpak.sh             # Flatpak packaging automation script
│   ├── com.eduvanta.desktop.desktop   # FreeDesktop application entry
│   ├── com.eduvanta.desktop.metainfo.xml # AppStream metadata specification
│   ├── com.eduvanta.desktop.yml       # Flatpak build manifest (GNOME 47)
│   ├── icons/                       # Hicolor PNG icons (32px - 512px)
│   └── README.md                    # Detailed Flathub packaging documentation
├── src/
│   ├── Components/                  # Reusable UI primitives (Button, DropDown, Input, Modal)
│   ├── Provider/                    # Context providers (SocketContext, Theme)
│   ├── Utils/
│   │   └── api.utils.ts             # Axios API client with error handling
│   ├── features/
│   │   ├── Course/                  # Course catalog, creation form, validations, and store
│   │   │   └── v1/
│   │   │       ├── components/      # EditCourseModal, CourseTable, CourseForm
│   │   │       ├── store/           # Zustand course and student stores
│   │   │       └── Validations/     # Zod schema definitions
│   │   ├── CourseDetails/           # Dynamic syllabus & specification dossier
│   │   ├── Student/                 # Directory, filters, and student profile page
│   │   ├── admissions/              # Online candidate admissions & approval modal
│   │   ├── dashboard/               # Metric stats, dynamic charts, live updates
│   │   ├── media/                   # Photo albums & image gallery management
│   │   ├── notices/                 # Campus notice circulars
│   │   ├── payment/                 # Fee management & payment recording
│   │   ├── settings/                # Campus contact links & portal configuration
│   │   ├── system/                  # Health probes and RabbitMQ queue monitor
│   │   ├── teacher/                 # Faculty directory & photo upload manager
│   │   │   └── v1/
│   │   │       └── Validations/     # Teacher Zod validation schemas
│   │   └── testimonials/            # Alumni testimonial reviews
│   ├── types/
│   │   └── backend.types.ts         # TypeScript definitions for backend models
│   ├── App.tsx                      # Root application routes
│   └── main.tsx                     # Entry point mounting React DOM
├── src-tauri/
│   ├── Cargo.toml                   # Tauri Rust dependencies
│   ├── tauri.conf.json              # Window configuration, app ID, and bundle targets
│   ├── icons/                       # Platform icons (.icns, .ico, .png)
│   └── src/
│       └── main.rs                  # Native Rust application bootstrap
├── package.json
├── tsconfig.json
└── vite.config.ts                   # Vite bundler configuration & code splitting
```

---

## 🔌 API Integration & State Architecture

### Uniform Response Handling
All API interactions use [api.utils.ts](src/Utils/api.utils.ts), wrapping requests with authentication headers and extracting error messages:

```typescript
import api, { getErrorMessage } from "@/Utils/api.utils";

try {
  const res = await api.get("/api/v1/user/findAllCourse");
  console.log(res.data.data);
} catch (error) {
  toast.error(getErrorMessage(error, "Failed to fetch courses"));
}
```

### Global Store Synchronization
Zustand stores maintain in-memory application state with optimistic updates:
- **`course.store.ts`**: Holds active programs, supports `setCourse`, `addCourse`, `updateCourseInStore`, and `removeCourse`.
- **`student.store.ts`**: Maintains filtered student lists and individual dossiers.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
