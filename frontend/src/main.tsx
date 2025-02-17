import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {StyledEngineProvider} from "@mui/material";
import App from "./App.tsx";
import UserProvider from "./providers/user/UserProvider.tsx";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </StyledEngineProvider>
  </StrictMode>,
)
