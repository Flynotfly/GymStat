from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views.generic.edit import CreateView
from django.views.generic.detail import DetailView
from django.shortcuts import get_object_or_404, render

from .models import Training
from .forms import TrainingForm


class TrainingCreateUpdateView(LoginRequiredMixin, CreateView):
    model = Training
    form_class = TrainingForm
    template_name = 'training/training.html'

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['instance'] = self.get_object()
        kwargs['user'] = self.request.user
        return kwargs

    def get_object(self, **kwargs):
        pk = self.kwargs.get('pk')
        if pk:
            return get_object_or_404(Training, pk=pk, owner=self.request.user)
        else:
            return None

    def form_valid(self, form):
        form.instance.owner = self.request.user
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


def training_details(request, pk=None):
    if pk:
        training = get_object_or_404(Training, pk=pk, owner=request.user)
    else:
        training = None

    return render(
        request,
        'training/details.html',
        {
            'training': training,
        }
    )
