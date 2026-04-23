# 🚀 Remote Team Manager

> A full-stack project management API built with Django REST Framework — enabling distributed teams to manage workspaces, projects, tasks, and time logs with role-based access control.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Django](https://img.shields.io/badge/Django-4.2-green)
![DRF](https://img.shields.io/badge/DRF-3.14-red)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![CI](https://img.shields.io/badge/CI-GitHub_Actions-black)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Reflection](#reflection)

---

## Overview

Remote Team Manager is a RESTful API that helps distributed teams stay organised. It supports four user roles — **Owner**, **Manager**, **Developer**, and **Viewer** — each with clearly defined permissions. Teams can create workspaces, manage projects and tasks, log time, and track all activity in a real-time feed.

**Target Users:** Tech teams, remote companies, project managers, developers.

---

## ✨ Features

- 🔐 JWT Authentication with refresh tokens
- 👥 Role-Based Access Control (Owner / Manager / Developer / Viewer)
- 🏢 Multi-workspace support — each workspace is fully isolated
- 📁 Projects and tasks with Kanban-style status columns
- ✅ Subtasks with automatic parent task progress calculation
- ⏱️ Time logging per task per team member
- 📋 Activity feed — every action logged with actor and timestamp
- 🐳 Fully Dockerised with docker-compose
- 🔄 CI/CD via GitHub Actions (test → build → deploy)
- 🧪 18+ automated tests covering models, views, and permissions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.11 |
| Framework | Django 4.2 |
| API | Django REST Framework 3.14 |
| Auth | djangorestframework-simplejwt |
| Database | PostgreSQL 15 |
| Containerisation | Docker + docker-compose |
| CI/CD | GitHub Actions |
| Deployment | Railway |
| Config | python-decouple |
| Testing | pytest-django |

---

## 🚀 Local Setup

### Prerequisites
- Docker and docker-compose installed
- Git installed

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/remote-team-manager.git
cd remote-team-manager

# 2. Copy environment variables
cp .env.example .env

# 3. Edit .env with your values (see Environment Variables section)
nano .env

# 4. Build and start the containers
docker-compose up --build

# 5. Run migrations
docker-compose exec web python manage.py migrate

# 6. Create a superuser (optional)
docker-compose exec web python manage.py createsuperuser

# 7. The API is now running at:
# http://localhost:8000/api/
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory. See `.env.example` for the template.

| Variable | Example | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `django-insecure-xxxxx` | Django secret key |
| `DEBUG` | `True` | Debug mode (set False in production) |
| `DATABASE_URL` | `postgres://user:pass@db:5432/dbname` | PostgreSQL connection string |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Frontend origin for CORS |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | ❌ | Register a new user |
| POST | `/api/auth/login/` | ❌ | Login and get JWT tokens |
| POST | `/api/auth/token/refresh/` | ❌ | Refresh access token |
| GET | `/api/auth/me/` | ✅ | Get current user profile |

### Workspaces

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/workspaces/` | ✅ | Any member |
| POST | `/api/workspaces/` | ✅ | Any authenticated user |
| GET | `/api/workspaces/{id}/` | ✅ | Workspace member |
| PATCH | `/api/workspaces/{id}/` | ✅ | Owner only |
| DELETE | `/api/workspaces/{id}/` | ✅ | Owner only |
| POST | `/api/workspaces/{id}/members/` | ✅ | Owner only |

### Projects

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/workspaces/{id}/projects/` | ✅ | Any member |
| POST | `/api/workspaces/{id}/projects/` | ✅ | Owner / Manager |
| PATCH | `/api/workspaces/{id}/projects/{id}/` | ✅ | Owner / Manager |
| DELETE | `/api/workspaces/{id}/projects/{id}/` | ✅ | Owner only |

### Tasks

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/projects/{id}/tasks/` | ✅ | Any member |
| POST | `/api/projects/{id}/tasks/` | ✅ | Owner / Manager / Developer |
| PATCH | `/api/projects/{id}/tasks/{id}/` | ✅ | Assignee / Manager / Owner |
| DELETE | `/api/projects/{id}/tasks/{id}/` | ✅ | Owner / Manager |

**Task Filters:** `?status=todo` `?priority=high` `?assignee={user_id}` `?due_date=2025-12-01`

### Time Logs & Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks/{id}/timelogs/` | Log hours against a task |
| GET | `/api/workspaces/{id}/timelogs/` | All time logs (Manager+) |
| GET | `/api/workspaces/{id}/activity/` | Activity feed |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Returns `{"status": "ok"}` |

---

## Example API Request

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass123", "first_name": "John", "last_name": "Doe"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass123"}'

# Create Workspace (with token)
curl -X POST http://localhost:8000/api/workspaces/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Team Workspace"}'
```

---

## 🧪 Running Tests

```bash
# Run all tests
docker-compose exec web pytest

# Run with coverage report
docker-compose exec web pytest --cov=apps --cov-report=term-missing

# Run a specific test file
docker-compose exec web pytest tests/test_permissions.py -v
```

---

## ☁️ Deployment

This project is deployed on **Railway**.

**Live URL:** `https://your-app.railway.app`

To deploy your own instance:
1. Create a Railway account at railway.app
2. Connect your GitHub repository
3. Add a PostgreSQL plugin
4. Set all environment variables from the table above
5. Railway auto-deploys on every push to `main`

---

## 💭 Reflection

*To be completed at project end — 300–500 words covering the hardest problem solved, one technical decision I would make differently, and one feature I would add next.*

---

## 👤 Author

**Your Name**
- GitHub: [@your_username](https://github.com/your_username)
- Bootcamp: Django Bootcamp 2025

---

*Built as a final project for Django Bootcamp 2025.*
