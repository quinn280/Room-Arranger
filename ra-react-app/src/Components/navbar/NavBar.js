import React from "react";
import { NavLink } from "react-router-dom";
import "./navbar.scss";

const NavBar = () => (
  <header id="nav-wrapper">
    <nav id="nav">
      <div class="nav left">
        <span class="gradient skew"><h1 class="logo un-skew"><a href="#home">Room Arranger</a></h1></span>
        <button id="menu" class="btn-nav"><span class="fas fa-bars"></span></button>
      </div>
      <div class="nav right">
        <NavLink to="/" class="nav-link active"><span class="nav-link-span"><span class="u-nav">Home</span></span></NavLink>
        <NavLink to="/floorplan" class="nav-link"><span class="nav-link-span"><span class="u-nav">Floor Plan</span></span></NavLink>
        <NavLink to="/explore" class="nav-link"><span class="nav-link-span"><span class="u-nav">Explore</span></span></NavLink>
        <NavLink to="/about" class="nav-link"><span class="nav-link-span"><span class="u-nav">About</span></span></NavLink>
      </div>
    </nav>
  </header>
);

export default NavBar;