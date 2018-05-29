import React from 'react'
import {AuthConsumer} from './AuthContext'
import {Container, Form} from 'semantic-ui-react'

class Login extends React.Component {

  state = {name: '', email: '', submittedName: '', submittedEmail: ''}

  handleChange = (e, {name, value}) => this.setState({[name]: value})

  handleSubmit = () => {
    const {name, email} = this.state
    this.setState({submittedName: name, submittedEmail: email})
    this.props.login(name, email);
  }

  componentDidMount() {

  }

  render() {
    const { name, email } = this.state
    return (<Container>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Input placeholder='Name' name='name' value={name} onChange={this.handleChange}/>
            <Form.Input placeholder='Email' name='email' value={email} onChange={this.handleChange}/>
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
