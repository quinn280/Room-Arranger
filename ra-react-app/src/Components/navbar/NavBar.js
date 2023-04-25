import React from "react";
import { NavLink } from "react-router-dom";
import "./navbar.scss";

const NavBar = () => (
  <header id="nav-wrapper">
    <nav id="nav">
      <div className="nav left">
        <span className="gradient skew"><h1 className="logo un-skew"><NavLink to="/">Room Arranger</NavLink></h1></span>
        <button id="menu" className="btn-nav"><span className="fas fa-bars"></span></button>
      </div>
      <div className="nav right">
        <NavLink to="/" className="nav-link"><span className="nav-link-span"><span className="u-nav">Home</span></span></NavLink>
        <NavLink to="/floorplan" className="nav-link"><span className="nav-link-span"><span className="u-nav">Floor Plan</span></span></NavLink>
        <NavLink to="/saved" className="nav-link"><span className="nav-link-span"><span className="u-nav">Saved</span></span></NavLink>
        <NavLink to="/about" className="nav-link"><span className="nav-link-span"><span className="u-nav">About</span></span></NavLink>
      </div>
    </nav>
  </header>
);

export default NavBar;