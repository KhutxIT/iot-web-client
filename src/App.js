import './App.css';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { createContext, useContext } from 'react';
import auth from "./services/auth";

const AuthContext = createContext();

function ProvideAuth({ children }) {
  const verify = auth();
  return (
    <AuthContext.Provider value={verify}>
      {children}
    </AuthContext.Provider>
  );
}

function PrivateRoute({ children }) {
  const auth = useContext(AuthContext);
  return (
    <Route render={() => auth ? (children) : <Redirect to="/login" />} />
  );
}

function App() {
  return (
    <ProvideAuth>
      <Router>
        <Switch>
          <PrivateRoute exact path="/">
            <Home />
          </PrivateRoute>
          <Route path="/login">
            <Login />
          </Route>
        </Switch>
      </Router>
    </ProvideAuth>
  );
}

export default App;
