import {AuthChangeRedirector} from "../auth";
import {Outlet} from "react-router-dom";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations, treeViewCustomizations
} from "../dashboard/theme/customizations";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../shared-theme/AppTheme.tsx";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function MainLayout(props: { disableCustomTheme?: boolean }) {
  return (
    <AuthChangeRedirector>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ru'>
        <AppTheme {...props} themeComponents={xThemeComponents}>
          <CssBaseline enableColorScheme />
          <Outlet/>
        </AppTheme>
      </LocalizationProvider>
    </AuthChangeRedirector>
  );
}
