import { Card, CardContent, Typography, Box } from '@mui/material';

export interface ExerciseCardProps {
  name: string;
  description: string;
  iconId: number | "";
  iconColor: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ExerciseCard({ name, description, iconId, iconColor }: ExerciseCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {/* Icon placeholder */}
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: iconColor,
              borderRadius: 1,
              mr: 2
            }}
          />
          <Typography variant="h6" component="div">
            {name}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description} {iconId}
        </Typography>
      </CardContent>
    </Card>
  );
}
