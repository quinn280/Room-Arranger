import React from "react";
import FloorPlan from './Pages/floorplan/floorplan';
import Home from './Pages/home/home';
import Saved from './Pages/saved/saved';
import About from './Pages/about/about';
import Editor from './Components/Editor/Editor';
import NavBar from './Components/navbar/NavBar';
import { Routes, Route } from 'react-router-dom';
import './App.css'

// Manages multiple pages
const Routing = () => (
  <Routes>
    <Route path='/' element={<Home/>}></Route>
    <Route path='/floorplan' element={<FloorPlan/>}></Route>
    <Route path='/saved' element={<Saved/>}></Route>
    <Route path='/about' element={<About/>}></Route>
    <Route path='/file/:file' element={<Editor/>}></Route>
  </Routes>
);

const App = () => (
  <div className="App">
    <NavBar className="AppNavBar"/>
    <Routing className="AppRouting"/>
  </div>
);

export default App;