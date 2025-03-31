import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RefreshHandler from './RefreshHandler';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from "@react-oauth/google";

import UserLayout from './UserPages/UserNavbar/Layout';
import AuthorityLayout from './AuthorityPages/AuthorityNavbar/Layout';

import Login from './Pages/Login';
import Signup from './Pages/Signup';

import UserHome from './UserPages/Home';
import Authorities from './UserPages/Authorities';
import Profile from './UserPages/Profile';
import ReportIssue from './UserPages/ReportIssue';
import ViewIssues from './UserPages/ViewIssues';
import IssueCategory from './UserPages/IssueCategory';
import SimilarIssues from './UserPages/SimilarIssues';
import ViewCategory from './UserPages/ViewCategory';

import AuthorityHome from './AuthorityPages/AuthorityHome';
import AuthorityProfile from './AuthorityPages/AuthorityProfile';
import AuthorityView from './AuthorityPages/AuthorityView';
import CurrentManaging from './AuthorityPages/CurrentManaging';
import AuthorityCategory from './AuthorityPages/AuthorityCategory';
import ManagingCategory from './AuthorityPages/ManagingCategory';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const PrivateRoute = ({ element, roles }) => {
    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }

    const role = localStorage.getItem('role');
    if (!isAuthenticated || (roles && !roles.includes(role))) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return element;
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const role = localStorage.getItem('role');
  const Layout = role === 'Authority' ? AuthorityLayout : UserLayout;

  // Add this component to your imports or create a new file for it
  const BrowserRefreshHandler = () => {
    useEffect(() => {
      // Check if we have a redirect URL in session storage
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      if (redirectUrl) {
        // Clear it so we don't redirect again
        sessionStorage.removeItem('redirectUrl');
        // Parse the URL to get the pathname
        const url = new URL(redirectUrl);
        // Use navigate to go to the correct route without a full page reload
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    }, []);
  
    return null;
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
        <div className="App">
          <BrowserRefreshHandler />
          <ToastContainer />
          <RefreshHandler setIsAuthenticated={setIsAuthenticated} />

          {isAuthPage ? (
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
              <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <Signup />} />
            </Routes>
          ) : (
            <Layout>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/home" replace />}
                />
                <Route
                  path="/home"
                  element={
                    <PrivateRoute
                      element={role === 'Authority' ? <AuthorityHome /> : <UserHome />}
                    />
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <PrivateRoute
                      element={
                        role === 'Authority'
                          ? <AuthorityProfile setIsAuthenticated={setIsAuthenticated} />
                          : <Profile setIsAuthenticated={setIsAuthenticated} />
                      }
                    />
                  }
                />

                <Route
                  path="/view-issues"
                  element={
                    <PrivateRoute
                      element={
                        role === 'Authority'
                          ? <AuthorityView setIsAuthenticated={setIsAuthenticated} />
                          : <ViewIssues setIsAuthenticated={setIsAuthenticated} />
                      }
                    />
                  }
                />

                <Route path="/report-issue" element={<PrivateRoute element={<ReportIssue />} />} />
                <Route path="/current-managing" element={<PrivateRoute element={<CurrentManaging />} />} />
                <Route path="/authorities" element={<PrivateRoute element={<Authorities />} />} />
                <Route path="/category" element={<PrivateRoute element={<IssueCategory />} />} />
                <Route path="/view-category" element={<PrivateRoute element={<ViewCategory />} />} />
                <Route path="/managing-category" element={<PrivateRoute element={<ManagingCategory />} />} />
                <Route path="/authority-category" element={<PrivateRoute element={<AuthorityCategory />} />} />
                <Route path="/similar-issues" element={<PrivateRoute element={<SimilarIssues />} />} />
              </Routes>
            </Layout>
          )}
        </div>
    </GoogleOAuthProvider>
  );
}

export default App;
