# from django.db.models import Q
# from django_filters import rest_framework as django_filters
#
# from .models import ExerciseTemplate
#
#
# class ExerciseTemplateFilter(django_filters.FilterSet):
#     tags = django_filters.CharFilter(method="filter_by_tags")
#     type = django_filters.ChoiceFilter(
#         choices=[
#             ("user", "User"),
#             ("admin", "Admin"),
#         ],
#         method="filter_by_type",
#         required=False,
#     )
#
#     class Meta:
#         model = ExerciseTemplate
#         fields = ["tags", "type"]
#
#     def filter_by_tags(self, queryset, name, value):
#         tags = value.split(",")
#         query = Q()
#         for tag in tags:
#             query &= Q(tags__contains=[tag])
#         return queryset.filter(query)
#
#     def filter_by_type(self, queryset, name, value):
#         if self.request:
#             user = self.request.user
#             if value == "user":
#                 return queryset.filter(owner=user, is_active=True)
#             elif value == "admin":
#                 return queryset.filter(is_admin=True, is_active=True)
#             return queryset.filter(
#                 Q(is_active=True), Q(owner=user) | Q(is_admin=True)
#             )
#         return queryset.filter(is_admin=True, is_active=True)
