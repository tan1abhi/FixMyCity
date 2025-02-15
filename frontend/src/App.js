import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RefreshHandler from './RefreshHandler';
import { ToastContainer } from 'react-toastify';

import Login from './Pages/Login';
import Signup from './Pages/Signup';

import UserHome from './UserPages/Home';
import Authorities from './UserPages/Authorities';
import Profile from './UserPages/Profile';
import ReportIssue from './UserPages/ReportIssue';
import ViewIssues from './UserPages/ViewIssues';
import UserNavbar from './UserPages/Navbar';

import AdminHome from './AdminPages/AdminHome';
import AdminNavbar from './AdminPages/AdminNavbar';
import AdminProfile from './AdminPages/AdminProfile';
import AdminView from './AdminPages/AdminView';
import CurrentManaging from './AdminPages/CurrentManaging';

import { GoogleOAuthProvider } from "@react-oauth/google";
const CLIENT_ID = "685413249760-j3kd1971kh2dj2kdvsqlkkd3699spe62.apps.googleusercontent.com";


function loadGapiAuth() {
  window.gapi.load("auth2", () => {
      window.gapi.auth2.init({
          client_id: "685413249760-j3kd1971kh2dj2kdvsqlkkd3699spe62.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/drive.readonly"
      }).then(() => {
          console.log("Google Auth initialized");
      }).catch(err => console.error("Error initializing Google Auth", err));
  });
}




function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();   // to get the url location of user

    useEffect(() => {
      loadGapiAuth();
  }, []);

  const PrivateRoute = ({ element, roles }) => {
    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }
  
    const role = localStorage.getItem('role'); // Get the role from localStorage
    if (!isAuthenticated || (roles && !roles.includes(role))) {
      return <Navigate to="/login" state={{ from: location }} />;
    }
  
    return element;
  };
  
  // Determine which Navbar to display
  const role = localStorage.getItem('role');
  const Navbar = role === 'Authority' ? AdminNavbar : UserNavbar;

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
    <div className="App">
      <ToastContainer />
      {isAuthenticated && <Navbar />}
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path='/' element={<Navigate to="login" />} />
        <Route path='/login' element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
        <Route path='/signup' element={isAuthenticated ? <Navigate to="/home" /> : <Signup />} />

        <Route
          path='/home'
          element={
            <PrivateRoute
              element={
                localStorage.getItem('role') === 'Authority' ? <AdminHome /> : <UserHome />
              }
            />
          }
        />

        <Route
          path='/profile'
          element={
            <PrivateRoute
              element={
                localStorage.getItem('role') === 'Authority' 
                  ? <AdminProfile setIsAuthenticated={setIsAuthenticated} /> 
                  : <Profile setIsAuthenticated={setIsAuthenticated} />
              }
            />
          }
        />

        <Route
          path='/view-issues'
          element={
            <PrivateRoute
              element={
                localStorage.getItem('role') === 'Authority' 
                  ? <AdminView setIsAuthenticated={setIsAuthenticated} /> 
                  : <ViewIssues setIsAuthenticated={setIsAuthenticated} />
              }
            />
          }
        />

        <Route path='/report-issue' element={<PrivateRoute element={<ReportIssue />} />} />
        <Route path='/current-managing' element={<PrivateRoute element={<CurrentManaging />} />} />
        <Route path='/authorities' element={<PrivateRoute element={<Authorities />} />} />

      </Routes>
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;
