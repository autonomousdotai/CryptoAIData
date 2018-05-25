import React from 'react'
import {AuthConsumer} from './AuthContext'
import {Link} from 'react-router-dom'

class Hello extends React.Component {
  render() {
    return (
      <div>
        <AuthConsumer>
          {({isAuth, login, logout}) => (
            <div>
              {isAuth ? (
                <h1>auth</h1>
              ) : (
                <h1>un auth</h1>
              )}
            </div>
          )}
        </AuthConsumer>
      </div>
    )
  }
}

export default Hello
