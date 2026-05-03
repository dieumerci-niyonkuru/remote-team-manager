from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
import time

class SuggestTasksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt', '').lower()
        
        # Simulate AI processing delay for realism
        time.sleep(1.5)

        # Smart mock logic based on keywords
        tasks = []
        if 'login' in prompt or 'auth' in prompt:
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
                {"title": "Build Aggregation API", "priority": "high", "description": "Create backend views to aggregate productivity data."}
            ]
        else:
            # Generic breakdown
            tasks = [
                {"title": f"Research & Planning: {prompt[:20]}...", "priority": "high", "description": "Gather requirements and create initial specs."},
                {"title": "UI/UX Design", "priority": "medium", "description": "Design the interface components."},
                {"title": "Backend API Implementation", "priority": "high", "description": "Set up the necessary database models and endpoints."},
                {"title": "Frontend Integration", "priority": "high", "description": "Connect the React frontend to the new APIs."},
                {"title": "QA & Testing", "priority": "medium", "description": "Perform comprehensive testing."}
            ]

        return Response({"tasks": tasks})
