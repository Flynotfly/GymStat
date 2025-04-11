import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ForgotPassword from '../components/ForgotPassword.tsx';
import AppTheme from '../../shared-theme/AppTheme.tsx';
import ColorModeSelect from '../../shared-theme/ColorModeSelect.tsx';
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {getCookie} from "../utils.ts";
import {useConfig} from "../../auth";
import {login} from "../../auth/lib/allauth";
import Card from "../components/SignInCard.ts";
import SignInContainer from "../components/SignInContainer.ts";
import SitemarkIcon from "../../icons/SitemarkIcon.tsx";
import {fetchCsrf} from "../api.ts";

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  // const [formError, setFormError] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [fetching, setFetching] = React.useState(false);

  // @ts-ignore: Unused variable
  const config = useConfig();


  // const { user, setUser } = useContext(UserContext);
  // const { session, setSession } = useContext(SessionContext);

  // @ts-ignore: Unused variable
  const navigate = useNavigate();

  useEffect(() => {
    fetchCsrf().catch(console.error);
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) {
      return;
    }
    // if (emailError || passwordError) {
    //   return;
    // }

    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
      console.error("Missing CSRF token");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const emailField = formData.get('email');
    const passwordField = formData.get('password');

    if (!emailField || !passwordField) {
      console.error("Email or password is missing");
      return;
    }

    const email = emailField.toString()
    const password = passwordField.toString()
    setFetching(true);
    login({email, password}).then(() => setFetching(false))
      .catch((e) => {
        console.error(e);
        window.alert(e)
      })
  };

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="flex-start">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            {/*<FormControlLabel*/}
            {/*  control={<Checkbox value="remember" color="primary" />}*/}
            {/*  label="Remember me"*/}
            {/*/>*/}
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={fetching}
            >
              Sign in
            </Button>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Forgot your password?
            </Link>
          </Box>
          <Divider/>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/*<Button*/}
            {/*  fullWidth*/}
            {/*  variant="outlined"*/}
            {/*  onClick={() => alert('Sign in with Google')}*/}
            {/*  startIcon={<GoogleIcon />}*/}
            {/*>*/}
            {/*  Sign in with Google*/}
            {/*</Button>*/}
            <Typography sx={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <Link
                href="/sign-up"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
