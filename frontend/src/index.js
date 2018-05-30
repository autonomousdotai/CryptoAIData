import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Landing from './Landing'
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
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route path="/" component={Landing} />
        </Switch>
      </AuthProvider>
    </Router>
  </div>
)

render(<App />, document.getElementById('root'))
