import React from 'react'
import {AuthConsumer} from './AuthContext'
import {Container, Form, Segment} from 'semantic-ui-react'
import {Route, Redirect} from 'react-router'

class Login extends React.Component {

  state = {email: '', password: '', submittedEmail: '', submittedPassword: ''}

  handleChange = (e, {name, value}) => this.setState({[name]: value})

  handleSubmit = () => {
    const {email, password} = this.state
    this.setState({submittedEmail: email, submittedPassword: password})
    this.props.login(email, password);
  }

  componentDidMount() {

  }

  render() {
    const {email, password} = this.state;
    return (
      <Segment vertical loading={this.props.isLoading}>
        {this.props.isAuth ?
          <Redirect to="/"/>
          :
          <div className="ui center aligned grid container">
            <Container text style={{marginTop: "1em"}}>
              <h1 style={{fontSize: '3rem'}}>Sign in to your account</h1>
              <Form onSubmit={this.handleSubmit}>
                  <Form.Input placeholder='Name' name='email' value={email} onChange={this.handleChange}/>
                  <Form.Input placeholder='Password' name='password' type='password' value={password}
                              onChange={this.handleChange}/>
                  <Form.Button primary content='Login' size='large'/>
              </Form>
            </Container>
          </div>
        }
      </Segment>
    )
  }
}

export default props => (<AuthConsumer>
    {({login, isLoading, isAuth}) => {
      return <Login {...props} login={login} isAuth={isAuth} isLoading={isLoading}/>
    }}
  </AuthConsumer>
)
