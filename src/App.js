import React, { useReducer, useEffect  } from 'react';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import { authService } from "./services/firebase";
// import "./styles.css";
import Chat from "./pages/Chat";
import Room from "./pages/Room";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";

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
    authService.onAuthStateChanged((user) => {
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
    <Router>
      <Routes>

        <Route
          path="/"
          element={<PublicRoute authenticated={authenticated} component={Login} />}
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
          path="/chat"
          element={<PrivateRoute authenticated={authenticated} component={Chat} />}
        />

        <Route
          path="/room"
          element={<PrivateRoute authenticated={authenticated} component={Room} />}
        />

      </Routes>
    </Router>
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}

export default App;
