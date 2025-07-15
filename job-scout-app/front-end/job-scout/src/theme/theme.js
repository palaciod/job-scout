import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: {
              main: '#ff9800',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: '#000000',
              secondary: '#555555',
            },
          }
        : {
            primary: {
              main: '#07ff77ff',
            },
            background: {
              default: '#111319',
              paper: '#1a1c22',
            },
            text: {
              primary: '#f0f0f0',
              secondary: '#bbbbbb',
            },
          }),
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1a1c22' : '#ffffff',
          },
        },
      },
    },
  });
