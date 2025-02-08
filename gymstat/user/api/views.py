from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            token = response.data.get('access')
            # Set the token in an HttpOnly cookie
            response.set_cookie(
                key='access_token',
                value=token,
                httponly=True,
                secure=False,  # Use secure flag in production (HTTPS)
                samesite='Lax',  # or 'Strict' as appropriate
            )
        return response
