import React from 'react'
import agent from './agent'

const AuthContext = React.createContext()

class AuthProvider extends React.Component {
  state = {isAuth: false || !!localStorage.token, isLoading: false, token: localStorage.token, userId: localStorage.userId}

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
      this.setState({userId: resBody.id})
      localStorage.setItem('token', resBody.token)
      localStorage.setItem('userId', resBody.id)
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
          token: this.state.token,
          userId: this.state.userId
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

const AuthConsumer = AuthContext.Consumer

export {AuthProvider, AuthConsumer}
