import Login from './login/Login'
import Account from './login/Account'

import React from 'react';
import { Router, Route, Switch } from 'dva/router';

function RouterConfig({ history }:any) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/account" exact component={Account} />
        <Route path="/encrypt" exact component={Account} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
