import React from 'react';
import Signup from './Auth/Signup';
import Login from './Auth/Login';
import Calendar from './Calendar/Calendar';
import { BrowserRouter as Router, Route } from 'react-router-dom'; 
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Route exact path='/' component={Login} /> {/* app = home */}
        <Route path='/login' component={Login} />
        <Route path='/calendar' component={Calendar} />
        <Route path='/signup' component={Signup} />
      </div>
    </Router>
  );
}

export default App;
