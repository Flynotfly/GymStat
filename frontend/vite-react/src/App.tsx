import {createBrowserRouter, matchPath, Outlet, RouterProvider, useLocation} from "react-router-dom";
import AppTheme from "./shared-theme/AppTheme.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations, treeViewCustomizations
} from "./dashboard/theme/customizations";
import Box from "@mui/material/Box";
import SideMenu from "./dashboard/components/SideMenu.tsx";
import AppNavbar from "./dashboard/components/AppNavbar.tsx";
import Stack from "@mui/material/Stack";
import Header from "./dashboard/components/Header.tsx";
import {alpha} from "@mui/material/styles";
import {lazy} from "react";
import Copyright from "./dashboard/internals/components/Copyright.tsx";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const Home = lazy(() => import("./pages/Home.tsx"));
const Training = lazy(() => import("./pages/Training.tsx"));
const Body = lazy(() => import("./pages/Body.tsx"));
const Tasks = lazy(() => import("./pages/Tasks.tsx"));
const SignIn = lazy(() => import("./sign-in/SignIn.tsx"));
const SignUp = lazy(() => import("./sign-up/SignUp.tsx"));
const Promo = lazy(() => import("./pages/Promo.tsx"));

// function useRouteMatch(patterns: readonly string[]) {
//   const {pathname} = useLocation();
//
//   for (let i = 0; i < patterns.length; i += 1) {
//     const pattern = patterns[i];
//     const possibleMatch = matchPath(pattern, pathname);
//     if (possibleMatch !== null) {
//       return possibleMatch;
//     }
//   }
//   return null;
// }
//
// type tabIndexPattern = {
//   index: number,
//   pattern: string,
// }
//
// function matchTabIndex(patterns: readonly tabIndexPattern[], currentTab: string|undefined) {
//   const matchingPattern = patterns.find(({ pattern }) => pattern === currentTab);
//   return matchingPattern ? matchingPattern.index : -1;
// }

function RouteLayout(props: { disableCustomTheme?: boolean }) {
  // const pagePatterns = ["/", "/trainings", "/body", "/tasks"];
  // const tabPatterns: tabIndexPattern[] = [
  //   { index: 0, pattern: "/" },
  //   { index: 1, pattern: "/trainings" },
  //   { index: 2, pattern: "/body" },
  //   { index: 3, pattern: "/tasks" },
  // ];
  // const routeMatch = useRouteMatch(pagePatterns);
  // const currentTab = routeMatch?.pattern?.path;
  // const tabIndex = matchTabIndex(tabPatterns, currentTab);
  const tabIndex = 0;

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
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
            <Header />
            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
              <Outlet />
              <Copyright sx={{ my: 4 }} />
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Promo/>,
  },
  {
    path: "/app",
    element: <RouteLayout/>,
    children: [
      { index: true, element: <Home/> },
      { path: "/trainings", element: <Training/> },
      { path: "/body", element: <Body/> },
      { path: "/tasks", element: <Tasks/> },
    ],
  },
  {
    path: "/sign-in",
    element: <SignIn/>,
  },
  {
    path: "/sign-up",
    element: <SignUp/>,
  }
]);



function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App
