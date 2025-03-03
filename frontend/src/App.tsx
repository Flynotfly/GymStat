import {AuthContextProvider} from "./auth";
import Router from "./router/Router.tsx";
import {StyledEngineProvider} from "@mui/material";



function App() {
  return (
    <StyledEngineProvider>
      <AuthContextProvider>
        <Router/>
      </AuthContextProvider>
    </StyledEngineProvider>
  );
}

export default App
