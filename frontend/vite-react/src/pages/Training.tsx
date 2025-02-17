import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import CustomizedDataGrid from "../dashboard/components/CustomizedDataGrid.tsx";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
import AddIcon from '@mui/icons-material/Add';
import MenuButton from "../dashboard/components/MenuButton.tsx";
import SettingsIcon from '@mui/icons-material/Settings';
import Box from "@mui/material/Box";
import {useEffect, useState} from "react";
import {TrainingInterface} from "../dashboard/internals/data/gridDataMy.tsx";
import {getAllTrainings} from "../api.ts";

export default function Training() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [trainings, setTrainings] = useState<TrainingInterface[]>([])

  useEffect(() => {
    getAllTrainings()
      .then(data => {
        setTrainings(data);
        console.log('trainings: ', data);
      })
      .catch(err => console.log("Error fetching trainings: ", err));
  }, []);

  return (
    <>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Training
      </Typography>
      <Box sx={{
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row', // Stack on small screens
        justifyContent: 'space-between', // Align buttons to the sides on larger screens
        alignItems: isSmallScreen ? 'stretch' : 'center',
        mb: 2,
        gap: 2, // space between buttons when stacked or side by side
      }}>
      <Button
        variant="contained"
        size="small"
        color="primary"
        endIcon={<AddIcon />}
        fullWidth={isSmallScreen}
      >
        Add training
      </Button>
      <MenuButton aria-label="Open notifications">
        <SettingsIcon />
      </MenuButton>
      </Box>
      <Grid container spacing={2} columns={12}>
        <CustomizedDataGrid trainings={trainings}/>
      </Grid>
    </>
  );
}
