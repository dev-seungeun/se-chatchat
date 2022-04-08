import React from "react";
import { Route, Navigate } from "react-router-dom";

function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return authenticated === true ? <Component /> : <Navigate to="/login" />;
}

export default PrivateRoute;
