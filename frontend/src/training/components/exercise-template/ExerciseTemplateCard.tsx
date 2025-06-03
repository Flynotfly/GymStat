import { Box, Card, CardContent, Chip, Typography } from '@mui/material';

import {ExerciseTemplate} from "../../types/exerciseTemplate";

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

        {/* Fields Chips */}
        {template.fields && template.fields.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {template.fields.map((field, idx) => (
              <Chip key={idx} label={field} variant="outlined" size="small" />
            ))}
          </Box>
        )}

        {/* Tags Chips */}
        {template.tags && template.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {template.tags.map((tag, idx) => (
              <Chip key={idx} label={tag} variant="filled" color="primary" size="small" />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
