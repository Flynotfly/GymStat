import Box from "@mui/material/Box";
import SideMenu from "../dashboard/components/SideMenu.tsx";
import AppNavbar from "../dashboard/components/AppNavbar.tsx";
import {alpha} from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Header from "../dashboard/components/Header.tsx";
import {Outlet, useLocation} from "react-router-dom";
import Copyright from "../dashboard/internals/components/Copyright.tsx";

export default function AppRouteLayout() {
  const { pathname } = useLocation();

  let tabIndex = 0;
  let pageTitle = "Home";

  // Determine tab index and page title based on the URL's start
  if (pathname.startsWith("/app/trainings")) {
    tabIndex = 1;
    pageTitle = "Trainings";
  } else if (pathname.startsWith("/app/exercises")) {
    tabIndex = 2;
    pageTitle = "Exercises";
  } else if (pathname.startsWith("/app/body")) {
    tabIndex = 3;
    pageTitle = "Body";
  } else if (pathname.startsWith("/app/tasks")) {
    tabIndex = 4;
    pageTitle = "Tasks";
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu selected={tabIndex}/>
      <AppNavbar selected={tabIndex}/>
      {/* Main content */}
      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
            : alpha(theme.palette.background.default, 1),
          overflow: 'auto',
        })}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
            mx: 3,
            pb: 5,
            mt: { xs: 8, md: 0 },
          }}
        >
          <Header title={pageTitle}/>
          <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
            <Outlet />
            <Copyright sx={{ my: 4 }} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}