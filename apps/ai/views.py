from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
import time
import re

class SuggestTasksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt', '').lower()
        
        # Natural language command detection
        # e.g. "create 5 tasks for mobile app"
        count_match = re.search(r'(\d+)\s+task', prompt)
        task_count = int(count_match.group(1)) if count_match else None

        # Simulate AI processing delay for realism
        time.sleep(1.2)

        tasks = []

        # === Natural language patterns ===
        if 'mobile app' in prompt or 'ios' in prompt or 'android' in prompt:
            tasks = [
                {"title": "Setup React Native project", "priority": "high", "description": "Initialize project and configure navigation."},
                {"title": "Design UI wireframes", "priority": "high", "description": "Create Figma mockups for all screens."},
                {"title": "Build authentication flow", "priority": "high", "description": "Login, register, forgot password screens."},
                {"title": "Integrate backend APIs", "priority": "high", "description": "Connect REST endpoints to mobile views."},
                {"title": "Push notifications setup", "priority": "medium", "description": "Configure FCM for Android and APNs for iOS."},
                {"title": "Performance testing", "priority": "low", "description": "Profile and optimize render performance."},
            ]
        elif 'login' in prompt or 'auth' in prompt or 'authentication' in prompt:
            tasks = [
                {"title": "Design UI for Login Page", "priority": "high", "description": "Create responsive mockups for desktop and mobile."},
                {"title": "Setup Authentication API", "priority": "high", "description": "Implement JWT endpoints in Django."},
                {"title": "Database Models", "priority": "medium", "description": "Update user models for OAuth support."},
                {"title": "E2E Testing", "priority": "low", "description": "Write Cypress tests for the login flow."}
            ]
        elif 'dashboard' in prompt or 'analytics' in prompt:
            tasks = [
                {"title": "Design Dashboard Layout", "priority": "medium", "description": "Wireframe the main dashboard components."},
                {"title": "Implement Chart Components", "priority": "high", "description": "Integrate Chart.js or pure CSS charts."},
                {"title": "Build Aggregation API", "priority": "high", "description": "Create backend views to aggregate productivity data."},
                {"title": "Real-time data sync", "priority": "medium", "description": "Use WebSockets or polling to refresh charts."},
            ]
        elif 'payment' in prompt or 'checkout' in prompt or 'stripe' in prompt:
            tasks = [
                {"title": "Design checkout UI", "priority": "high", "description": "Create card input form with validation."},
                {"title": "Integrate Stripe SDK", "priority": "high", "description": "Setup Stripe.js and payment intents."},
                {"title": "Backend payment endpoint", "priority": "high", "description": "Create /api/payments/charge/ endpoint."},
                {"title": "Webhook handler", "priority": "medium", "description": "Handle Stripe events (success, failed, refund)."},
                {"title": "Email receipt system", "priority": "low", "description": "Send confirmation emails after payment."},
            ]
        elif 'api' in prompt or 'backend' in prompt or 'endpoint' in prompt:
            tasks = [
                {"title": "Define API schema", "priority": "high", "description": "Write OpenAPI/Swagger spec."},
                {"title": "Create Django models", "priority": "high", "description": "Define database models and relationships."},
                {"title": "Build serializers", "priority": "high", "description": "Create DRF serializers with validation."},
                {"title": "Write viewsets and URLs", "priority": "high", "description": "Implement CRUD endpoints."},
                {"title": "Authentication middleware", "priority": "medium", "description": "Apply JWT auth to all endpoints."},
                {"title": "Write API tests", "priority": "medium", "description": "Cover all endpoints with pytest."},
            ]
        else:
            # Generic intelligent breakdown
            feature_name = prompt[:30].strip().title()
            base = [
                {"title": f"Requirements & Research: {feature_name}", "priority": "high", "description": "Gather requirements, study existing solutions, write specs."},
                {"title": "UI/UX Design", "priority": "medium", "description": "Create wireframes and high-fidelity mockups."},
                {"title": "Backend API Implementation", "priority": "high", "description": "Set up database models and REST endpoints."},
                {"title": "Frontend Integration", "priority": "high", "description": "Connect the React frontend to the new APIs."},
                {"title": "Unit & Integration Tests", "priority": "medium", "description": "Achieve >80% test coverage."},
                {"title": "Code Review & QA", "priority": "low", "description": "Peer review and UAT."},
                {"title": "Documentation", "priority": "low", "description": "Update README, API docs, and Knowledge Base."},
            ]
            tasks = base

        # If user specified a count, trim/pad
        if task_count:
            tasks = tasks[:task_count]

        return Response({"tasks": tasks, "command_type": "breakdown"})
