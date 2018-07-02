import React from 'react';
import {Grid, Image, Container, Input,Header, Tab, Icon, Card, Button, Form, Segment, Item, Visibility} from 'semantic-ui-react'
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
      values: [],
      profile: null
    };
  }

  componentDidMount() {
    let self = this;
    let profileId = this.props.match.params.profileId
    agent.req.get(agent.API_ROOT + '/api/profile/' + profileId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
      self.setState({
        categories: resBody.categories,
        profile: resBody,
        values: Array(resBody.categories.length).fill('')
      });
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

    const panes = [
      { menuItem: 'DataSet Owner', render: () =>
            <Tab.Pane attached={false}>
                {this.state.categories.map(function (item, i) {
                  return (
                    <Item key={i}>
                      <Item.Content style={{textAlign: "left"}}>
                        <Item.Header as='a'>Category: {item.name}</Item.Header>
                        <Item.Description>Image classified / Total images: {item.total_classify} / {item.total_image}</Item.Description>
                        <Item.Description>Balance: {item.balance}</Item.Description>
                        <Item.Description>
                          <div className='ui input' >
                          <input  placeholder='Your wallet address' type="text" value={self.state.values[i] || ''}
                                onChange={self.handleChange.bind(self, i)}/>
                          </div>
                          <Button type='submit' onClick={self.handleClick.bind(self, i)}>Withdrawn</Button>
                        </Item.Description>
                      </Item.Content>
                    </Item>
                  )
                })}
            </Tab.Pane> }, 
    ]

    return (

      <Segment vertical>
        <Container>
        <Header as='h2' icon textAlign='center'>
          <Icon name='user' circular  />
          <Header.Content  >
                <div className='ui three buttons'>
                     <Button basic color='grey' content={this.state.profile && this.state.profile.following_categories ? `Datasets ${this.state.profile.following_categories.length}` : 'Datasets 0'} ></Button>
                     <Button basic color='grey' content={this.state.profile ? `Photos ${this.state.profile.total_upload_images}` : 'Photos'} ></Button>
                     <Button basic color='grey' content={this.state.profile && this.state.profile.following_profile ? `Follows ${this.state.profile.following_profile.length}` : 'Follows 0'} ></Button>
                </div>
          </Header.Content>
        </Header>

        <Container>
              <Card fluid  color='orange'>
                <Card.Content>
                  <Card.Meta>
                      <Tab menu={{ secondary: true, pointing: true }} panes={panes}  />
                </Card.Meta>
                </Card.Content>
                </Card>

          </Container>
          {/*Segments for Avata Profile */ }

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
