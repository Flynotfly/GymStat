from django import forms

from .models import Training, Exercise


class TrainingForm(forms.ModelForm):
    class Meta:
        model = Training
        fields = ['conducted', 'description']


class ExerciseForm(forms.ModelForm):
    class Meta:
        model = Exercise
        fields = ['training', 'order', 'weight', 'repetitions']


ExerciseFormSet = forms.inlineformset_factory(
    Training,
    Exercise,
    form=ExerciseForm
)
