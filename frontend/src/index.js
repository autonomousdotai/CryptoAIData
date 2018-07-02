import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, withRouter, Route, Switch } from 'react-router-dom'
 

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
import  FileUploader from './Upload'  
import Explore from './Explore'

const App = () => (
  <div>
    <Router  >
      <AuthProvider>
        <HeaderPage>
        <Switch>
          <ProtectedRoute exact path="/dashboard" component={Dashboard} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/explore" component={Explore} />
          <ProtectedRoute exact path="/history" component={History} />
          <ProtectedRoute exact path="/upload" component={FileUploader} />
          <ProtectedRoute exact path="/dataset/create" component={CategoryClassify} />
          <ProtectedRoute exact path="/p/:profileId" component={Profile} />
          <Route exact path="/cat/:categoryId" component={ImageList} />
          <Route exact path="/" component={Home} />
        </Switch>
        </HeaderPage>
      </AuthProvider>
    </Router>
  </div>
)

render(<App />, document.getElementById('root'))
