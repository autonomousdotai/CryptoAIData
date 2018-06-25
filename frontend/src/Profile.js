import React from 'react';
import {Grid, Image, Container, Input,Header, Icon, Button, Form, Segment, Item, Visibility} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'


class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      categories: [],
      name: '',
      values: []
    };
  }

  componentDidMount() {
    let self = this;
    let profileId = this.props.match.params.profileId
    agent.req.get(agent.API_ROOT + '/api/profile/' + profileId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
      console.log(resBody);
      self.setState({categories: resBody.categories})
      self.setState({values: Array(resBody.categories.length).fill('')})
    }).catch((e) => {
    })
  }

  handleChange(i, event) {
    let values = [...this.state.values];
    values[i] = event.target.value;
    this.setState({values});
    if (values[i].length == 1 && i == this.state.values.length - 1) {
      this.setState(prevState => ({values: [...prevState.values, '']}))
    }
  }

  handleClick(i, event) {
    let self = this;
    console.log(this.state.categories[i])
    let address = this.state.values[i]
    let category = this.state.categories[i].category_id
    agent.req.post(agent.API_ROOT + '/api/withdraw/', {address, category}).set('authorization', `JWT ${this.props.token}`).type('form').then((response) => {
      let resBody = response.body;
      console.log(resBody);
      let category = resBody.id;
    }).catch((e) => {
    })
  }

  render() {
    let self = this;
    return (
      <Segment vertical>
        <Container>
        <Header as='h2' icon textAlign='left'>
          <Icon name='user' circular style={{margin:0}} />
          <Header.Content>
          {this.props.user.ether_address}
          </Header.Content> 
        </Header>  
          {/*Segments for Avata Profile */ }
          
          <Item.Group>
            {this.state.categories.map(function (item, i) {
              return (
                <Item key={i}>
                  <Item.Content style={{textAlign: "left"}}>
                    <Item.Header as='a'>Category: {item.name}</Item.Header>
                    <Item.Description>Contract: {item.contract}</Item.Description>
                    <Item.Description>Image classified / Total images: {item.total_classify} / {item.total_image}</Item.Description>
                    <Item.Description>Balance: {item.balance}</Item.Description>
                    <Item.Description>
                      <div className='ui input' >
                      <input style={{minWidth: "27em"}} placeholder='Your wallet address' type="text" value={self.state.values[i] || ''}
                             onChange={self.handleChange.bind(self, i)}/>
                      </div>
                      <Button type='submit' onClick={self.handleClick.bind(self, i)}>Withdrawn</Button>
                    </Item.Description>
                  </Item.Content>
                </Item>
              )
            })}
          </Item.Group>

              <Link to={'/login'}  > 
                    <Button style={{marginTop:60}} size='mini' onClick={()=>this.props.logout()}  >
                     <Icon name='sign out'  /> Logout
                  </Button>
                </Link> 

        </Container>
      </Segment>
    )
  }
}

export default props => (<AuthConsumer>
    {({token,user, logout, isLoading, isAuth}) => {
      return <Profile {...props} token={token} user={user} logout={logout} isLoading={isLoading} isAuth={isAuth}/>
    }}
  </AuthConsumer>
)
