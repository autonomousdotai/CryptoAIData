import React from 'react'
import agent from './agent'

const AuthContext = React.createContext()

class AuthProvider extends React.Component {
  state = {isAuth: false, isLoading: false}

  constructor() {
    super()
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
  }

  login(email, password) {
    this.setState({isLoading: true})
    agent.Auth.login(email, password).then((response) => {
      this.setState({isAuth: true})
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
          logout: this.logout
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

const AuthConsumer = AuthContext.Consumer

export {AuthProvider, AuthConsumer}
