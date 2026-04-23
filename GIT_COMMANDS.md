# ===========================
# GIT COMMIT GUIDE
# One command block per day
# Copy and paste exactly
# ===========================


# ============================================================
# FIRST TIME ONLY — Run this once to set up the repo
# ============================================================

# Step 1: Go to github.com → New Repository
# Name: remote-team-manager
# Visibility: Public
# Do NOT add README (we already have one)
# Click: Create repository

# Step 2: Run these commands in your terminal:

git init
git add .
git commit -m "chore: initial project scaffold — README, Docker, CI, gitignore"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/remote-team-manager.git
git push -u origin main


# ============================================================
# WEEK 1 — Foundation
# ============================================================

# --- DAY 1: Django setup, settings, packages ---
git add requirements.txt config/settings.py config/urls.py manage.py
git commit -m "chore: initialise Django project with all required packages"
git push

# --- DAY 2: Docker ---
git add Dockerfile docker-compose.yml
git commit -m "chore: add Dockerfile and docker-compose with PostgreSQL service"
git push

# --- DAY 3: Environment config ---
git add .env.example config/settings.py
git commit -m "chore: configure python-decouple for environment variable management"
git push

# --- DAY 3 continued: Custom User model ---
git add apps/users/models.py apps/users/migrations/
git commit -m "feat: add custom User model with email as the login field"
git push

# --- DAY 3 continued: JWT auth endpoints ---
git add apps/users/serializers.py apps/users/views.py apps/users/urls.py config/urls.py
git commit -m "feat: add JWT register and login endpoints using simplejwt"
git push

# --- DAY 4: Workspace model ---
git add apps/workspaces/models.py apps/workspaces/migrations/
git commit -m "feat: add Workspace and WorkspaceMember models with role choices"
git push

# --- DAY 5: RBAC permissions ---
git add apps/workspaces/permissions.py
git commit -m "feat: add custom RBAC permission classes for workspace roles"
git push

# --- DAY 6: Workspace API ---
git add apps/workspaces/serializers.py apps/workspaces/views.py apps/workspaces/urls.py
git commit -m "feat: add Workspace CRUD API endpoints with role-based permissions"
git push


# ============================================================
# WEEK 2 — Projects & Tasks
# ============================================================

# --- DAY 7: Project model + API ---
git add apps/projects/
git commit -m "feat: add Project model and CRUD API scoped to workspace"
git push

# --- DAY 8: Task model ---
git add apps/tasks/models.py apps/tasks/migrations/
git commit -m "feat: add Task model with status, priority, assignee and due date"
git push

# --- DAY 9: Task API + permissions ---
git add apps/tasks/serializers.py apps/tasks/views.py apps/tasks/urls.py
git commit -m "feat: add Task CRUD API with RBAC — only managers and owners can delete"
git push

# --- DAY 10: Subtask ---
git add apps/tasks/models.py apps/tasks/migrations/ apps/tasks/serializers.py
git commit -m "feat: add Subtask model with progress rollup to parent task"
git push

# --- DAY 11: Filtering ---
git add apps/tasks/filters.py apps/tasks/views.py
git commit -m "feat: add task filtering by status, priority, assignee and due date"
git push


# ============================================================
# WEEK 3 — Time Logs & Activity
# ============================================================

# --- DAY 12: TimeLog ---
git add apps/tasks/models.py apps/tasks/serializers.py apps/tasks/views.py apps/tasks/migrations/
git commit -m "feat: add TimeLog model and API for logging hours against tasks"
git push

# --- DAY 13: Activity Feed + signals ---
git add apps/tasks/signals.py apps/tasks/apps.py
git commit -m "feat: add ActivityFeed model and Django signals for automatic action logging"
git push

# --- DAY 14: Member invite API ---
git add apps/workspaces/views.py apps/workspaces/serializers.py
git commit -m "feat: add workspace member invite API with role assignment"
git push

# --- DAY 15: Health check + response format ---
git add config/urls.py apps/
git commit -m "feat: add health check endpoint and standardise all API response format"
git push


# ============================================================
# WEEK 4 — Tests
# ============================================================

# --- DAY 16: Model tests ---
git add tests/test_models.py tests/conftest.py
git commit -m "test: add model tests for User, Workspace, Project and Task"
git push

# --- DAY 17: View tests ---
git add tests/test_views.py
git commit -m "test: add view tests for auth, workspace and task happy paths"
git push

# --- DAY 18: Permission tests ---
git add tests/test_permissions.py
git commit -m "test: add permission boundary tests for all four workspace roles"
git push

# --- DAY 19: Edge case tests ---
git add tests/test_views.py tests/test_models.py
git commit -m "test: add edge case tests — invalid assignments, duplicates, empty fields"
git push


# ============================================================
# WEEK 5 — CI/CD, Deploy, Docs
# ============================================================

# --- DAY 20: GitHub Actions ---
git add .github/
git commit -m "chore: add GitHub Actions CI pipeline — test, build, deploy on push to main"
git push

# --- DAY 21: Deployment config ---
git add Dockerfile docker-compose.yml requirements.txt
git commit -m "chore: update deployment config for Railway production environment"
git push

# --- DAY 22: README ---
git add README.md
git commit -m "docs: complete README with setup, env vars, API endpoints and examples"
git push

# --- DAY 23: Reflection ---
git add REFLECTION.md
git commit -m "docs: add written project reflection — 400 words"
git push

# --- DAY 24: Final cleanup ---
git add .
git commit -m "refactor: final cleanup — remove debug prints, dead code, add inline comments"
git push


# ============================================================
# USEFUL COMMANDS (use anytime)
# ============================================================

# Check what files changed before committing
git status

# See your full commit history (looks great with many small commits!)
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Check which branch you are on
git branch

# Create a new feature branch (optional advanced practice)
git checkout -b feature/task-filtering
