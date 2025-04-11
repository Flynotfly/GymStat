import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { ExerciseTemplate } from '../types/training';

interface ExerciseTemplateCardProps {
  template: ExerciseTemplate;
}

export default function ExerciseTemplateCard({ template }: ExerciseTemplateCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {template.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {template.description}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {template.fields.map((field, idx) => (
            <Chip key={idx} label={field} variant="outlined" size="small" />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
