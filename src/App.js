import React, { useReducer, useEffect, useRef  } from "react";
import { HashRouter, Routes, Route  } from "react-router-dom";
import { _authStateChagned } from "./helpers/auth";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";
import Chat from "./pages/Chat";
import Room from "./pages/Room";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";

const initialState = {
    authenticated: false,
    loading: true
};

function reducer(state, action) {
    switch (action.type) {
        case "GET_USER":
            return { ...state, authenticated: action.result };
        default:
            return state;
    }
}

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { authenticated } = state;

    useEffect(() => {
        _authStateChagned(function(user) {
            if (user) {
                dispatch({
                    type: "GET_USER",
                    result: true,
                });
            } else {
                dispatch({
                    type: "GET_USER",
                    result: false,
                });
            }
        });
    }, []);

    return (
        <HashRouter>
            <Routes>

                <Route
                    path="/"
                    element={<PublicRoute authenticated={authenticated} component={Login} exact  />}
                />

                <Route
                    path="/signup"
                    element={<PublicRoute authenticated={authenticated} component={SignUp} />}
                />

                <Route
                    path="/login"
                    element={<PublicRoute authenticated={authenticated} component={Login} />}
                />

                <Route
                    path="/chat/:roomName"
                    element={<PrivateRoute authenticated={authenticated} component={Chat} />}
                />

                <Route
                    path="/room"
                    element={<PrivateRoute authenticated={authenticated} component={Room} />}
                />

            </Routes>
        </HashRouter>
    );
}

export default App;
