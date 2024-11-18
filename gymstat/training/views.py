from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.generic.edit import CreateView
from django.views.generic.detail import DetailView
from django.shortcuts import get_object_or_404, render

from .models import Training
from .forms import TrainingForm, ExerciseFormSet


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


@login_required
def training_details(request, pk=None):
    if pk:
        training = get_object_or_404(Training, pk=pk, owner=request.user)
    else:
        training = None

    if request.method == 'POST':
        training_form = TrainingForm(request.POST, instance=training)
        exercise_formset = ExerciseFormSet(request.POST, instance=training)
        if training_form.is_valid() and exercise_formset.is_valid():
            training = training_form.save(commit=False)
            training.owner = request.user
            training.save()
            exercise_formset.instance = training
            exercise_formset.save()
            return JsonResponse({
                'success': True,
                'message': 'Form saved successfully'
            })
        return JsonResponse({
            'success': False,
            'errors': {
                'training_form': training_form.errors,
                'exercise_formset': exercise_formset.errors,
            }
        })

    training_form = TrainingForm(instance=training)
    exercise_formset = ExerciseFormSet(instance=training)

    return render(
        request,
        'training/details.html',
        {
            'training': training,
            'training_form': training_form,
            'exercise_formset': exercise_formset,
        }
    )
