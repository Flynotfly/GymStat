from django import forms

from .models import Training


class TrainingForm(forms.ModelForm):
    class Meta:
        model = Training
        fields = ['conducted', 'description']

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.instance.owner = user
