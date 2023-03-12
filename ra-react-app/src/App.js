import React from "react";
import FloorPlan from './Pages/floorplan/floorplan';
import Home from './Pages/home/home';
import Explore from './Pages/explore/explore';
import About from './Pages/about/about';
import NavBar from './Components/navbar/NavBar';
import { Routes, Route } from 'react-router-dom';
import './App.css'

// Manages multiple pages
const Routing = () => (
  <Routes>
    <Route exact path='/' element={<Home/>}></Route>
    <Route exact path='/floorplan' element={<FloorPlan/>}></Route>
    <Route exact path='/explore' element={<Explore/>}></Route>
    <Route exact path='/about' element={<About/>}></Route>
  </Routes>
);

const App = () => (
  <div className="App">
    <NavBar className="AppNavBar"/>
    <Routing className="AppRouting"/>
  </div>
);

export default App;