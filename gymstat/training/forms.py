from django import forms

from .models import Training, Exercise, ExerciseType


class TrainingForm(forms.ModelForm):
    class Meta:
        model = Training
        fields = ['conducted', 'description']
        widgets = {
            'conducted': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'form-control',
                'placeholder': 'YYYY-MM-DD HH:MM',
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Description of the trainings session...',
            }),
        }


class ExerciseForm(forms.ModelForm):
    template_name_div = 'training/forms/exercise.html'

    class Meta:
        model = Exercise
        fields = ['training', 'exercise_type', 'order', 'weight', 'repetitions']
        widgets = {
            'training': forms.HiddenInput(),
            'exercise_type': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Choose exercise type',
            }),
            'order': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Order of exercise',
            }),
            'weight': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Weight in kg',
            }),
            'repetitions': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Number of repetitions',
            }),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.fields['exercise_type'].queryset = ExerciseType.objects.filter(bookmarked=user)
        else:
            self.fields['exercise_type'].queryset = ExerciseType.objects.none()


ExerciseFormSet = forms.inlineformset_factory(
    Training,
    Exercise,
    form=ExerciseForm,
    can_delete=True,
    extra=0,
)


class ExerciseTypeForm(forms.ModelForm):
    class Meta:
        model = ExerciseType
        fields = ['name', 'private']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter name of exercise',
            }),
            'private': forms.CheckboxInput(attrs={
                'class': 'form-check-input',
            }),
        }
