from typing import Dict, Any

from allauth.headless.adapter import DefaultHeadlessAdapter


class CustomHeadlessAdapter(DefaultHeadlessAdapter):
    def serialize_user(self, user) -> Dict[str, Any]:
        ret = super().serialize_user(user)
        if user.first_name:
            ret["first_name"] = user.first_name
        if user.last_name:
            ret["last_name"] = user.last_name
        return ret
