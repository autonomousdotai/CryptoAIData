import React from 'react'
import {AuthConsumer} from './AuthContext'
import {Container, Form} from 'semantic-ui-react'

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
    const { email, password } = this.state
    return (<Container>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Input placeholder='Name' name='email' value={email} onChange={this.handleChange}/>
            <Form.Input placeholder='Password' name='password' type='password' value={password} onChange={this.handleChange}/>
            <Form.Button content='Submit'/>
          </Form.Group>
        </Form>
      </Container>
    )
  }
}

export default props => (<AuthConsumer>
    {({login}) => {
      return <Login {...props} login={login}/>
    }}
  </AuthConsumer>
)
