import React, { useEffect, useState } from 'react'
import './Home.css'

function Home() {
  

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Welcome to FixMyCity</h1>
        <p className="home-subtitle">
          Empowering citizens to report and resolve issues in their city.
        </p>
      </header>
      <div className="home-content">
        <div className="feature-card">
          <h2 className="feature-title">Report Issues</h2>
          <p className="feature-description">
            Identify problems in your city, such as potholes, streetlight outages, or waste management issues.
          </p>
        </div>
        <div className="feature-card">
          <h2 className="feature-title">Track Progress</h2>
          <p className="feature-description">
            Stay updated on the status of your reports and see how your city is improving.
          </p>
        </div>
        <div className="feature-card">
          <h2 className="feature-title">Connect with Authorities</h2>
          <p className="feature-description">
            Collaborate with city officials and make your voice heard to drive positive change.
          </p>
        </div>
      </div>
      <footer className="home-footer">
        <p className="footer-text">&copy; {new Date().getFullYear()} FixMyCity. All rights reserved.</p>
      </footer>
    </div>

  );
}

export default Home


