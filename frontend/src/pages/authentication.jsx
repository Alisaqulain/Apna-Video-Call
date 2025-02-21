import * as React from 'react';
import {
  Avatar, Button, CssBaseline, TextField, Paper, Box, Grid, Typography,
  createTheme, ThemeProvider, Snackbar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthContext } from '../contexts/AuthContext';

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0); 
  const [open, setOpen] = React.useState(false);

  // Ensure AuthContext is available
  const authContext = React.useContext(AuthContext);
  if (!authContext) {
    console.error("AuthContext is undefined! Ensure AuthProvider wraps your components.");
    return <Typography color="error">Error loading authentication</Typography>;
  }

  const { handleRegister, handleLogin } = authContext;
  const handleAuth = async () => {
    try {
        setError("");
        setMessage("")
        setOpen(false); 

        if (formState === 0) {
            // Login
            console.log("Attempting login:", username, password);
            await handleLogin(username, password);
            setMessage("Login successful! 🎉");
        } else {
            // Register
            console.log("Attempting registration:", name, username);
            await handleRegister(name, username, password);
            setMessage("Registration Successful! 🎉 Please login.");

            // Reset form
            setUsername("");
            setPassword("");
            setName("");
            setFormState(0);
        }
        
        console.log("Snackbar should display:", message);
        setOpen(true);

    } catch (error) {
        console.error("Auth error:", error);
        const errorMsg = error.response?.data?.message || "An error occurred. Please try again.";
        
        setError(errorMsg);
        setMessage(errorMsg);
        console.log("Snackbar error message:", errorMsg);
        setOpen(true);
    }
};


  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(/authbg.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => setFormState(0)}
              >
                Login
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => setFormState(1)}
              >
                Register
              </Button>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <Typography color="error">{error}</Typography>}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
  open={open}
  autoHideDuration={4000}
  onClose={() => setOpen(false)}
  message={message || "Something went wrong!"}
  anchorOrigin={{ vertical: "top", horizontal: "center" }} 
  key={message}
/>


    </ThemeProvider>
  );
}
