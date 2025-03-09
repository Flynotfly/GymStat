import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import CustomizedDataGrid from "../dashboard/components/CustomizedDataGrid.tsx";
import Button from "@mui/material/Button";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import {useTheme} from "@mui/material/styles";
import AddIcon from '@mui/icons-material/Add';
import MenuButton from "../dashboard/components/MenuButton.tsx";
import SettingsIcon from '@mui/icons-material/Settings';
import Box from "@mui/material/Box";
import {useEffect, useState} from "react";
import {TrainingInterface} from "../dashboard/internals/data/gridDataMy.tsx";
import {getAllTrainings} from "../api.ts";
import {Paper} from "@mui/material";
import {DateCalendar} from "@mui/x-date-pickers";
import EventIcon from '@mui/icons-material/Event';
import dayjs, { Dayjs } from 'dayjs';
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

export default function Training() {
  // const theme = useTheme();
  // const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [trainings, setTrainings] = useState<TrainingInterface[]>([])

  useEffect(() => {
    getAllTrainings()
      .then(data => {
        setTrainings(data);
        console.log('trainings: ', data);
      })
      .catch(err => console.log("Error fetching trainings: ", err));
  }, []);

  const handleCreateWorkoutToday = () => {
    // Logic for creating today's workout
  };

  const handleCreateWorkoutForDate = () => {
    // Logic for creating a workout on the selected date
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Training Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Calendar and Actions */}
        <Grid size={{xs: 12, md: 4}}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select Date
            </Typography>
            <DateCalendar
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
            />

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                fullWidth
                onClick={handleCreateWorkoutToday}
              >
                Create Workout for Today
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EventIcon />}
                fullWidth
                onClick={handleCreateWorkoutForDate}
              >
                Create Workout for Selected Date
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Training Results */}
        <Grid size={{xs: 12, md: 8}}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">
                Trainings on {selectedDate?.format('DD MMM YYYY')}
              </Typography>
              <MenuButton aria-label="settings">
                <SettingsIcon />
              </MenuButton>
            </Box>
            <CustomizedDataGrid trainings={trainings}/>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
