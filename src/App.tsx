import React from 'react';
import { BrowserRouter as Router, Switch, Route ,Link} from 'react-router-dom';
import {Login} from './login/Login'
import {Account} from './login/Account'
import './App.global.css';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route strict  path="/account" component={Account} />
        <Route strict   path="/" component={Login} />
      </Switch>
    </Router>
  );
}
