import React from 'react'
import {AuthConsumer} from './AuthContext' 
import { Container, Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import {Route, Redirect} from 'react-router'
import {Link} from 'react-router-dom'

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
      
      <Segment vertical loading={this.props.isLoading}  > 
          <style>{`
            body{
              background:url('images/bg.jpg')!important;
            }
          `}</style>
        {this.props.isAuth ?
          <Redirect to="/"/>
          :
          <div className="ui center aligned grid container">
            <Container text style={{marginTop: "1em"}}> 
              <Header as='h2' color='teal' textAlign='center'>
                <Image src="images/logo.png" style={{height:30, width:180}} />
              </Header>  
              <Form size='large' onSubmit={this.handleSubmit}>
                  
                  <Form.Input fluid placeholder='Name' name='email' value={email} onChange={this.handleChange}/>
                  
                  <Form.Input fluid placeholder='Password' name='password' type='password' value={password}
                              onChange={this.handleChange}/>
 
                  <Form.Button primary color='teal' fluid  content='Login' size='large' style={{marginTop:0}}/> 
                   
                  <Link to='/signup' style={{color:"#fff"}} >New to us? Sign Up</Link> 
                
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
