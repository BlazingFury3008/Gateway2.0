// This code defines a React component that implements a dark mode toggle using Material-UI (MUI) components. The component uses the `useState` hook to manage the state of the dark mode and the `createTheme` function to create a theme based on the current state. The `ThemeProvider` component is used to apply the theme to the entire application, and the `CssBaseline` component is included to ensure consistent styling across browsers. The UI includes a switch to toggle dark mode and a card component that displays some content, which will adapt its styling based on the selected theme.

"use client";

import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Card, CardContent, CardMedia, Switch, Typography } from "@mui/material"

export default function App() {

  // state to manage the dark mode
  const [toggleDarkMode, setToggleDarkMode] = useState(true);

  // function to toggle the dark mode as true or false
  const toggleDarkTheme = () => {
    setToggleDarkMode(!toggleDarkMode);
  };

  // applying the primary and secondary theme colors
  const darkTheme = createTheme({
    palette: {
      mode: toggleDarkMode ? 'dark' : 'light', // handle the dark mode state on toggle
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#131052',

      },
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>Toggle Dark mode</h2>
        <Switch checked={toggleDarkMode} onChange={toggleDarkTheme} />
        {/* rendering the card component with card content */}
        <Card sx={{ width: '30%', borderRadius: 3, padding: 1 }}>
          <CardContent>
            <CardMedia sx={{ height: 180, borderRadius: 3 }} image="https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg" title="semaphore" />
            <Typography variant="h4" component="div" sx={{ marginTop: 3 }}>
              Programming Blogs
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              by Semaphore
            </Typography>
            <Typography variant="body1">
              Checkout the latest blogs on Semaphore. Semaphore provides you the best CI/CD solution
              for high-performance engineering teams.
            </Typography>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  )
}
