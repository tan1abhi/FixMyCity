import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// ✅ Lazy load App.js
const App = lazy(() => import('./App'));

const theme = createTheme();
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* ✅ Show "Loading..." while App is loading */}
        <Suspense fallback={<div>Loading...</div>}>
          <App />
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
