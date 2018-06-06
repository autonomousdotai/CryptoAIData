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
import  History from './History'
import  CategoryClassify from './CategoryClassify'
import  Profile from './Profile'

const App = () => (
  <div>
    <Router>
      <AuthProvider>
        <HeaderPage>
        <Switch>
          <ProtectedRoute exact path="/dashboard" component={Dashboard} />
          <Route exact path="/login" component={Login} />
          <ProtectedRoute exact path="/history" component={History} />
          <ProtectedRoute exact path="/category" component={CategoryClassify} />
          <ProtectedRoute exact path="/p/:profileId" component={Profile} />
          <ProtectedRoute exact path="/:categoryId" component={ImageList} />
          <Route exact path="/" component={Home} />
        </Switch>
        </HeaderPage>
      </AuthProvider>
    </Router>
  </div>
)

render(<App />, document.getElementById('root'))
