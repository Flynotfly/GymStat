# from rest_framework import status
# from rest_framework.response import Response
# from rest_framework_simplejwt.views import TokenObtainPairView

# from .serializers import CustomTokenObtainPairSerializer


# class SetTokenObtainPairView(TokenObtainPairView):
#     def post(self, request, *args, **kwargs):
#         response = super().post(request, *args, **kwargs)
#
#         if response.status_code == 200:
#             serializer = self.get_serializer(data=request.data)
#             serializer.is_valid(raise_exception=True)
#             user = serializer.user
#
#             access_token = response.data.get('access')
#             refresh_token = response.data.get('refresh')
#
#             try:
#                 avatar_letter = user.first_name[0]
#             except Exception as e:
#                 avatar_letter = 'A'
#
#             print(response.data)
#
#             response.data = {
#                 "email": user.email,
#                 "full_name": user.get_full_name(),
#                 "avatar_letter": avatar_letter,
#             }
#
#             response.set_cookie(
#                 key='access_token',
#                 value=access_token,
#                 httponly=True,
#                 secure=False,  # TODO: change to true in production
#                 samesite='Lax',  # or 'Strict' as appropriate
#             )
#             response.set_cookie(
#                 key='refresh_token',
#                 value=refresh_token,
#                 httponly=True,
#                 secure=False,  # TODO: change to true in production
#                 samesite='Lax'  # or 'Strict' as appropriate
#             )
#         return response


# class CustomTokenObtainPairView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainPairSerializer

import json

from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfTokenAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"detail": "CSRF cookie set"})


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"detail": "Login successful"}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
