import React from "react";
import "./Landing.css";
import { NavLink, useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landin">
      <div className="header">
        <h2>MangoDB</h2>
        <div
          className="mid-spot"
          onClick={() => document.body.classList.toggle('gold')}
        ></div>
  <NavLink to="/register" className="contact-btn aadi" onClick={() => navigate('/register')}>
          <span className="glow"></span>
          <span className="contact-btn-content">SignUp / Login</span>
        </NavLink>
        <div className="spotlight">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>

      <canvas id="particleCanvas"></canvas>

      <div className="accent-lines">
        <div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className="heroSubP">
        <p>Introducing</p>
      </div>
      <div className="hero">
        <div className="heroT">
          <h2>AuraSphere</h2>
          <h2>AuraSphere</h2>
        </div>
      </div>
      <p className="heroP">
        The world's best platform, <br />
        to gamify your daily life.
      </p>
      <div className="mountains">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="hero-spacer"></div>
    </div>
  );
}
