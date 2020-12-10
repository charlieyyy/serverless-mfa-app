import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";


export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/profile">
        <Profile />
      </Route>
      <Route exact path="/signup">
        <Signup />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
