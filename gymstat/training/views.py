from django.http import JsonResponse
from django.views.generic.edit import CreateView
from django.shortcuts import get_object_or_404

from .models import Training
from .forms import TrainingForm


class TrainingCreateUpdateView(CreateView):
    model = Training
    form_class = TrainingForm
    template_name = 'training/training.html'

    def get_object(self, **kwargs):
        pk = self.kwargs.get('pk')
        if pk:
            return get_object_or_404(Training, pk=pk)
        else:
            return None

    def form_valid(self, form):
        training = form.save()
        return JsonResponse({
            'success': True,
            'id': training.id,
        })

    def form_invalid(self, form):
        return JsonResponse({
            'success': False,
            'errors': form.errors,
        })
