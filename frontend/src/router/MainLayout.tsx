import {AuthChangeRedirector} from "../auth";
import {Outlet} from "react-router-dom";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations, treeViewCustomizations
} from "../dashboard/theme/customizations";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../shared-theme/AppTheme.tsx";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function MainLayout(props: { disableCustomTheme?: boolean }) {
  return (
    <AuthChangeRedirector>
      <AppTheme {...props} themeComponents={xThemeComponents}>
        <CssBaseline enableColorScheme />
        <Outlet/>
      </AppTheme>
    </AuthChangeRedirector>
  );
}
