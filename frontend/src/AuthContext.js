import React from 'react'
import agent from './agent'

const AuthContext = React.createContext()

class AuthProvider extends React.Component {
  state = {isAuth: false}

  constructor() {
    super()
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
  }

  login(email, password) {
    console.log(email, password)
    agent.Auth.login(email, password).then((response) => {
      console.log(response);
      this.setState({isAuth: true})
    }).catch((e) => {
      this.setState({isAuth: false})
      console.log(e);
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
