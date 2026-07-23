<div align="center">

# 🚀 RemoteTeam Manager

**The all-in-one platform for distributed teams — projects, tasks, chat, video calls, and AI in one unified workspace.**

[![CI](https://github.com/dieumerci-niyonkuru/remote-team-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/dieumerci-niyonkuru/remote-team-manager/actions/workflows/ci.yml)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Django](https://img.shields.io/badge/Django-4.2-092E20?logo=django)](https://www.djangoproject.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Report Bug](https://github.com/dieumerci-niyonkuru/remote-team-manager/issues) · [Request Feature](https://github.com/dieumerci-niyonkuru/remote-team-manager/issues)

</div>

---

## Overview

RemoteTeam Manager is a production-ready SaaS platform built for modern distributed teams. It combines everything a remote team needs into a single, beautifully designed application: workspace management, project tracking, real-time chat, WebRTC video calls, Gantt scheduling, analytics, and AI-powered insights.

| Feature | Status |
|---|---|
| Multi-workspace with role-based access | ✅ Production Ready |
| Project and Task Management (Kanban) | ✅ Production Ready |
| Real-time Chat (WebSocket) | ✅ Production Ready |
| WebRTC Video / Audio Calls | ✅ Production Ready |
| Gantt Schedule Chart | ✅ Production Ready |
| File Management with Uploads | ✅ Production Ready |
| Team Analytics and Dashboard | ✅ Production Ready |
| Email Invitation System | ✅ Production Ready |
| Global Search | ✅ Production Ready |
| Dark / Light Mode | ✅ Production Ready |
| 3-Language Support (EN / FR / RW) | ✅ Production Ready |
| AI Workspace Assistant | ✅ Production Ready |
| Notification Center | ✅ Production Ready |
| Celery Background Tasks | ✅ Production Ready |
| CI/CD with GitHub Actions | ✅ Production Ready |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Framework |
| Vite | 6 | Build tool and dev server |
| TypeScript | 5 | Type safety |
| TailwindCSS | 3 | Utility-first styling |
| Zustand | 5 | Global state management |
| React Query | 5 | Server-state caching |
| React Router | 7 | Client-side routing |
| Lucide React | latest | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Django | 4.2 | Web framework |
| Django REST Framework | 3.15 | REST API |
| Django Channels | 4 | WebSocket / ASGI |
| Daphne | 4 | ASGI server |
| SimpleJWT | 5 | JWT authentication |
| Celery | 5 | Background task queue |
| django-celery-beat | 2 | Periodic scheduled tasks |

### Infrastructure

| Technology | Purpose |
|---|---|
| PostgreSQL 15 | Primary database |
| Redis 7 | Channel layers + Celery broker |
| Railway | Cloud deployment |
| GitHub Actions | CI/CD pipeline |
| WhiteNoise | Static file serving |

---

## Project Structure

```
remote-team-manager/
├── apps/
│   ├── accounts/          # User auth, profiles, JWT
│   ├── workspaces/        # Workspace and member management
│   ├── projects/          # Projects and task management
│   ├── chat/              # Real-time WebSocket chat
│   ├── notifications/     # Invitations and notifications
│   ├── files/             # File upload and management
│   └── analytics/         # Dashboard and reporting
├── config/
│   ├── settings.py        # Django settings
│   ├── urls.py            # Root URL configuration
│   └── asgi.py            # ASGI and WebSocket routing
├── src/
│   ├── pages/             # React page components
│   ├── components/        # Reusable UI components
│   ├── services/          # API client (Axios)
│   ├── store/             # Zustand global state
│   └── i18n/              # EN/FR/RW translations
├── .github/workflows/     # GitHub Actions CI/CD
├── start.sh               # Railway production boot script
├── Dockerfile             # Container build
├── railway.toml           # Railway deployment config
└── requirements.txt       # Python dependencies
```

---

## Quick Start

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+
- **PostgreSQL** 15+
- **Redis** 7+

### 1. Clone the repository

```bash
git clone https://github.com/dieumerci-niyonkuru/remote-team-manager.git
cd remote-team-manager
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Backend setup

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput

# Optional: load the full demo workspace (users, projects, tasks, chat, OKRs…)
python manage.py seed_demo
```

### 4. Frontend setup

```bash
npm install
```

### 5. Start development servers

**Terminal 1 — Django / Daphne:**
```bash
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

**Terminal 2 — Celery worker:**
```bash
celery -A config worker -l info
```

**Terminal 3 — React dev server:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Demo Data & Login

Running `python manage.py seed_demo` populates a complete, ready-to-explore
workspace — **Nexus Labs** — with 7 users, 4 projects, 28 tasks (with subtasks,
comments and time logs), 3 chat channels, an activity feed, OKRs, wiki articles,
notifications and HR records. The command is idempotent, so it is safe to re-run.

All demo accounts share the password **`demo1234`**. Sign in with the email
(or the username) plus that password:

| Role in workspace | Email | Username | Password |
|---|---|---|---|
| Owner (admin) | `demo@nexuslabs.io` | `demo` | `demo1234` |
| Manager | `amina@nexuslabs.io` | `amina` | `demo1234` |
| Developer | `kevin@nexuslabs.io` | `kevin` | `demo1234` |
| Developer | `sarah@nexuslabs.io` | `sarah` | `demo1234` |
| Developer | `david@nexuslabs.io` | `david` | `demo1234` |
| Developer | `grace@nexuslabs.io` | `grace` | `demo1234` |
| Viewer (read-only) | `tom@nexuslabs.io` | `tom` | `demo1234` |

> These are throwaway demo credentials for a local database. Set a different
> password with `python manage.py seed_demo --password <your-password>`, and
> never reuse them for a real deployment.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Django secret key (50+ chars) | `django-insecure-...` |
| `DEBUG` | Debug mode (False in production) | `False` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `yourdomain.com,localhost` |
| `FRONTEND_URL` | Frontend origin for CORS | `https://yourdomain.com` |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_HOST_USER` | SMTP username / email | `yourapp@gmail.com` |
| `EMAIL_HOST_PASSWORD` | SMTP password / app password | `your-app-password` |
| `OPENAI_API_KEY` | OpenAI key for AI features (optional) | `sk-...` |
| `DJANGO_SETTINGS_MODULE` | Settings module | `config.settings` |

---

## Deploy on Railway

This project is optimized for Railway deployment.

### Step 1 — Create a Railway project

1. Go to [railway.com](https://railway.com) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `dieumerci-niyonkuru/remote-team-manager`

### Step 2 — Add services

Add two additional services to your project:
- **PostgreSQL** — Add Service → Database → PostgreSQL
- **Redis** — Add Service → Database → Redis

### Step 3 — Set environment variables

In your Railway service settings, add all variables from the table above. Railway auto-injects `DATABASE_URL` and `REDIS_URL` when you link the database services.

### Step 4 — Deploy

Railway detects `railway.toml` and `start.sh` automatically and deploys your application. Migrations run on first deploy.

---

## CI/CD Pipeline

GitHub Actions runs automatically on every push to `main` or `develop`:

| Job | What it does |
|---|---|
| **Frontend Build** | Runs `npm ci` and `npm run build` — verifies zero TypeScript/bundle errors |
| **Backend Check** | Spins up PostgreSQL, runs Django check, migrate, and collectstatic |

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the full pipeline definition.

---

## API Overview

All endpoints are prefixed with `/api/`.

| Resource | Endpoint | Methods |
|---|---|---|
| Auth — Login | `/auth/login/` | POST |
| Auth — Register | `/auth/register/` | POST |
| Auth — Refresh token | `/auth/token/refresh/` | POST |
| Workspaces | `/workspaces/` | GET, POST |
| Workspace detail | `/workspaces/{id}/` | GET, PUT, DELETE |
| Workspace members | `/workspaces/{id}/members/` | GET, POST |
| Invite member | `/workspaces/{id}/invite/` | POST |
| Accept invite | `/workspaces/accept_invite/` | POST |
| Projects | `/projects/` | GET, POST |
| Tasks | `/tasks/` | GET, POST |
| Task detail | `/tasks/{id}/` | GET, PUT, PATCH, DELETE |
| Chat rooms | `/chat/rooms/` | GET, POST |
| Messages | `/chat/rooms/{id}/messages/` | GET, POST |
| File upload | `/files/` | GET, POST |
| Notifications | `/notifications/` | GET |
| Global search | `/search/?q={query}` | GET |
| Analytics | `/analytics/dashboard/` | GET |
| User profile | `/accounts/profile/` | GET, PATCH |

### WebSocket Endpoints

| Channel | URL |
|---|---|
| Chat | `ws://host/ws/chat/{room_id}/` |
| Notifications | `ws://host/ws/notifications/` |
| Video calls | `ws://host/ws/call/{room_id}/` |

---

## Role System

RemoteTeam uses a workspace-scoped role system:

| Role | Permissions |
|---|---|
| `owner` | Full control: delete workspace, manage members, all write access |
| `manager` | Invite/remove members, create/edit projects and tasks |
| `developer` | Create and update tasks, comment, upload files |
| `viewer` | Read-only access to all workspace content |

---

## Internationalization

The app ships with three languages selectable from the login and register screens:

| Language | Code | Coverage |
|---|---|---|
| English | `en` | 100% |
| French | `fr` | 100% |
| Kinyarwanda | `rw` | 100% |

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m "feat: add amazing feature"`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

Please run `npm run build` and `python manage.py check` before submitting.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with love by [Dieumerci Niyonkuru](https://github.com/dieumerci-niyonkuru)

**RemoteTeam Manager** — Empowering distributed teams worldwide

</div>
