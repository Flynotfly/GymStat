from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from training.models import Training


def training_list(request):
    trainings = Training.objects.filter(owner=request.user)
    return render(
        request,
        'user/trainings.html',
        {
            'trainings': trainings,
        }
    )


@login_required
def dashboard(request):
    return render(
        request,
        'user/dashboard.html',
        {}
    )
