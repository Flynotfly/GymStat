import Box from "@mui/material/Box";
import {CircularProgress} from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default' // Adapts to dark/light mode
      }}
    >
      <CircularProgress />
    </Box>
  )
}