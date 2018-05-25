import React from 'react'
import {AuthConsumer} from './AuthContext'
import {Link} from 'react-router-dom'
import {Container, Form} from 'semantic-ui-react'


class Login extends React.Component {
  state = {email: '', password: '', submittedEmail: '', submittedPassword: ''}
  handleChange = (e, {name, value}) => this.setState({[name]: value})
  handleSubmit = () => {
    const { email, password } = this.state
    this.setState({ submittedEmail: email, submittedPassword: password })
    console.log('submit');
    this.setState({isAuth: true})
  }

  render() {
    const {email, password, submittedEmail, submittedPassword} = this.state
    return <Container>
      <AuthConsumer>
        {({isAuth, login, logout}) => (
          <div>
            {isAuth ? (
              <ul>
                <Link to="/dashboard">
                  Dashboard
                </Link>
                <button onClick={logout}>logout</button>
              </ul>
            ) : (
              <Form onSubmit={this.handleSubmit}>
                <Form.Group>
                  <Form.Input placeholder='Name' name='email' value={email} onChange={this.handleChange}/>
                  <Form.Input placeholder='Email' name='password' value={password} onChange={this.handleChange}/>
                  <Form.Button content='Submit'/>
                </Form.Group>
              </Form>
            )}
          </div>
        )}
      </AuthConsumer>
    </Container>
  }
}

export default Login
