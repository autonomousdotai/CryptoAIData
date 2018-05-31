import React from 'react'
import agent from './agent'

const AuthContext = React.createContext()

class AuthProvider extends React.Component {
  state = {isAuth: false || !!localStorage.token, isLoading: false, token: localStorage.token}

  constructor() {
    super()
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
  }

  login(email, password) {
    this.setState({isLoading: true})
    agent.req.post(agent.API_ROOT + '/api/signin/', {email, password}).type('form').then((response) => {
      let resBody = response.body;
      this.setState({isAuth: true})
      this.setState({token: resBody.token})
      localStorage.setItem('token', resBody.token)
      this.setState({isLoading: false})
    }).catch((e) => {
      this.setState({isAuth: false})
      this.setState({isLoading: false})
    })
  }

  logout() {
    this.setState({isAuth: false})
  }

  render() {
    return (
      <AuthContext.Provider
        value={{
          isAuth: this.state.isAuth,
          isLoading: this.state.isLoading,
          login: this.login,
          logout: this.logout,
          token: this.state.token
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

const AuthConsumer = AuthContext.Consumer

export {AuthProvider, AuthConsumer}
