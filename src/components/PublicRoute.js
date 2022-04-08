import React from "react";
import { Route, Navigate } from "react-router-dom";

function PublicRoute({ component: Component, authenticated, ...rest }) {
  return authenticated === false ? <Component /> : <Navigate to="/room" />;
}

export default PublicRoute;
