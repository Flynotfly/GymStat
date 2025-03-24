from typing import Dict, Any

from allauth.headless.adapter import DefaultHeadlessAdapter


class CustomHeadlessAdapter(DefaultHeadlessAdapter):
    def serialize_user(self, user) -> Dict[str, Any]:
        ret = super().serialize_user(user)
        if user.get_full_name():
            ret["full_name"] = user.get_full_name()
        return ret
