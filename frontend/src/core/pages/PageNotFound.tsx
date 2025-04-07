import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function PageNotFound () {
  return (
    <Container
      sx={{
        textAlign: 'center',
        mt: 8,
        minHeight: '100vh',
        backgroundColor: 'background.default', // Uses theme background color
        color: 'text.primary'                  // Uses theme text color
      }}
    >
      <Typography variant="h2" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
    </Container>
  );
}