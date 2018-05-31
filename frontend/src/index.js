import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Home from './Home'
import ImageList from './ImageList'
import Dashboard from './Dashboard'
import Login from './Login'
import ProtectedRoute from './ProtectedRoute'
import './css/semantic/dist/semantic.min.css'
import './css/index.css';
import  HeaderPage from './HeaderPage'

const App = () => (
  <div>
    <Router>
      <AuthProvider>
        <HeaderPage />
        <Switch>
          <ProtectedRoute exact path="/dashboard" component={Dashboard} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/" component={Home} />
          <ProtectedRoute exact path="/:categoryId" component={ImageList} />
        </Switch>
      </AuthProvider>
    </Router>
  </div>
)

render(<App />, document.getElementById('root'))
