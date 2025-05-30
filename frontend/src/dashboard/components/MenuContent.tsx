import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link } from "react-router-dom";

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, path: "/app" },
  { text: 'Trainings', icon: <AnalyticsRoundedIcon />, path: "/app/trainings" },
  { text: 'Templates', icon: <DescriptionIcon/>, path: "/app/trainings/templates" },
  { text: 'Exercises', icon: <FitnessCenterIcon />, path: "/app/exercises" },
  { text: 'Body', icon: <PeopleRoundedIcon />, path: "/app/body" },
  { text: 'Tasks', icon: <AssignmentRoundedIcon />, path: "/app/tasks" },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, path: "/settings" },
  { text: 'About', icon: <InfoRoundedIcon />, path: "/about" },
  { text: 'Feedback', icon: <HelpRoundedIcon />, path: "/feedback" },
];

export default function MenuContent({selected}: {selected: number}) {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton selected={index === selected} component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
