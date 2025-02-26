import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {StyledEngineProvider} from "@mui/material";
import App from "./App.tsx";
import {AuthChangeRedirector} from "./auth";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider>
      <AuthChangeRedirector>
        <App />
      </AuthChangeRedirector>
    </StyledEngineProvider>
  </StrictMode>,
)
