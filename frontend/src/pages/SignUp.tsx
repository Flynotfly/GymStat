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
import AppTheme from '../shared-theme/AppTheme.tsx';
import ColorModeSelect from '../shared-theme/ColorModeSelect.tsx';
import GoogleIcon from '../icons/GoogleIcon.tsx';
import SitemarkIcon from "../icons/SitemarkIcon.tsx";
import Card from "../components/SignInCard.ts";
import SignUpContainer from "../components/SignInContainer.ts";
import {useEffect} from "react";
import {fetchCsrf} from "../api.ts";
import {useConfig} from "../auth";
import {useNavigate} from "react-router-dom";
import {getCookie} from "../utils.ts";
import {signUp} from "../lib/allauth";

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [password2Error, setPassword2Error] = React.useState(false);
  const [password2ErrorMessage, setPassword2ErrorMessage] = React.useState('');
  const [firstNameError, setFirstNameError] = React.useState(false);
  const [firstNameErrorMessage, setFirstNameErrorMessage] = React.useState('');
  const [lastNameError, setLastNameError] = React.useState(false);
  const [lastNameErrorMessage, setLastNameErrorMessage] = React.useState('');
  const [fetching, setFetching] = React.useState(false);
  // const [nameError, setNameError] = React.useState(false);
  // const [nameErrorMessage, setNameErrorMessage] = React.useState('');

  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const password2Ref = React.useRef<HTMLInputElement>(null);
  const firstNameRef = React.useRef<HTMLInputElement>(null);
  const lastNameRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCsrf().catch(console.error);
  }, []);

  // @ts-ignore: Unused variable
  const config = useConfig()
  // @ts-ignore: Unused variable
  const navigate = useNavigate();

  const validateInputs = () => {
    const email = emailRef.current;
    const firstName = firstNameRef.current;
    const lastName = lastNameRef.current;
    const password = passwordRef.current;
    const password2 = password2Ref.current;

    let isValid = true;

    if (!email || !firstName || !lastName || !password || !password2) {
      console.error('One or more input elements are not rendered yet.');
      isValid = false;
      return;
    }

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
      setPassword2Error(false);
      setPassword2ErrorMessage('');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
      if (!password2.value || password.value !== password2.value) {
        setPassword2Error(true);
        setPassword2ErrorMessage('Passwords must be the same');
        isValid = false;
      } else {
        setPassword2Error(false);
        setPassword2ErrorMessage('');
      }
    }

    if (!firstName.value || firstName.value.length < 1){
      setFirstNameError(true);
      setFirstNameErrorMessage('First name is required');
      isValid = false;
    } else {
      setFirstNameError(false);
      setFirstNameErrorMessage('');
    }

    if (!lastName.value || lastName.value.length < 1){
      setLastNameError(true);
      setLastNameErrorMessage('Last name is required');
      isValid = false;
    } else {
      setLastNameError(false);
      setLastNameErrorMessage('');
    }
    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) {
      return;
    }

    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
      console.error("Missing CSRF token");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const emailField = formData.get('email');
    const firstNameField = formData.get('firstName');
    const lastNameField = formData.get('lastName');
    const passwordField = formData.get('password');

    if (!emailField || !firstNameField || !lastNameField || !passwordField ) {
      console.error("Input data is missing");
      return;
    }

    const email = emailField.toString();
    const first_name = firstNameField.toString();
    const last_name = lastNameField.toString();
    const password = passwordField.toString();

    setFetching(true);
    signUp({email, password, first_name, last_name}).then()
      .catch((e) => {
        console.error(e)
        window.alert(e)
      }).then(() => setFetching(false))
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="flex-start">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="firstName">First name</FormLabel>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                placeholder="Your first name"
                error={firstNameError}
                helperText={firstNameErrorMessage}
                color={firstNameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="lastName">Last name</FormLabel>
              <TextField
                autoComplete="family-name"
                name="lastName"
                required
                fullWidth
                id="lastName"
                placeholder="Your last name"
                error={lastNameError}
                helperText={lastNameErrorMessage}
                color={lastNameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password2">Password (again)</FormLabel>
              <TextField
                required
                fullWidth
                name="password2"
                placeholder="••••••"
                type="password"
                id="password2"
                autoComplete="new-password"
                variant="outlined"
                error={password2Error}
                helperText={password2ErrorMessage}
                color={password2Error ? 'error' : 'primary'}
              />
            </FormControl>
            {/*<FormControlLabel*/}
            {/*  control={<Checkbox value="allowExtraEmails" color="primary" />}*/}
            {/*  label="I want to receive updates via email."*/}
            {/*/>*/}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={fetching}
            >
              Sign up
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>or</Typography>
          </Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign up with Google')}
              startIcon={<GoogleIcon />}
            >
              Sign up with Google
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link
                href="/sign-in/"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
