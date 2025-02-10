from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import CustomTokenObtainPairSerializer


class SetTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.user

            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False,  # TODO: change to true in production
                samesite='Lax',  # or 'Strict' as appropriate
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=False,  # Change to True in production
                samesite='Lax'  # or 'Strict' as appropriate
            )

            try:
                avatar_letter = user.first_name[0] + user.last_name[0]
            except Exception as e:
                avatar_letter = 'AA'

            response = Response({
                "email": user.email,
                "full_name": user.get_full_name(),
                "avatar_letter": avatar_letter,
            }, status=status.HTTP_200_OK)

        return response


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
