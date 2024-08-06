import React from 'react';
import ReactDOM from 'react-dom'; // Correct import statement for ReactDOM
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './Home';
import App1 from './App1';
import App2 from './App2';
import App3 from './App3';
import { StatusProvider } from './StatusContext';

function MyApp() {
  return (
    <StatusProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/App1" element={<App1 />} /> 
          <Route path="/App2" element={<App2 />} /> 
          <Route path="/App3" element={<App3 />} /> 
        </Routes>
      </BrowserRouter>
    </StatusProvider>
  );
}


const rootElement = document.getElementById("root");
ReactDOM.render(<MyApp />, rootElement); // Using ReactDOM.render to render MyApp into the DOM
