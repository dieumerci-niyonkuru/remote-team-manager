# Project Reflection

**Student:** Your Name
**Project:** Remote Team Manager (#15)
**Bootcamp:** Django Bootcamp 2025
**Word count:** ~400 words

---

## The Hardest Problem I Solved

*Write here: describe the most technically difficult challenge you faced. Be specific — for example: "The hardest problem was enforcing object-level RBAC so that a Developer in Workspace A could not access any data in Workspace B, even if they knew the UUID. I solved this by overriding get_queryset() in every ViewSet to filter by the requesting user's workspace memberships, and writing a custom has_object_permission() method in my permission class that checks WorkspaceMember.objects.filter(workspace=obj, user=request.user).exists()."*

---

## One Technical Decision I Would Make Differently

*Write here: be honest and specific. Assessors respect honesty. For example: "I would set up the folder structure and URL routing before writing any models. I spent time refactoring my urls.py three times because I didn't plan the nesting of /workspaces/{id}/projects/{id}/tasks/ upfront. Planning the API contract first would have saved hours."*

---

## One Feature I Would Add Next

*Write here: pick something realistic and technical. For example: "I would add real-time task update notifications using Django Channels and WebSockets. When a task status changes, all workspace members currently viewing that project would receive an instant update without refreshing the page. I would implement this with a WorkspaceConsumer that broadcasts to a group channel named after the workspace ID."*

---

*Submitted as part of Django Bootcamp Final Project Assessment — 2025.*
