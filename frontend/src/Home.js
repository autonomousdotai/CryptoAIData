import React from 'react';
import {Grid, Image, Container, Card, Icon, Segment, Item, Visibility} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'


class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.state = {
      categories: [],
      nextURL: '',
      calculations: {
        bottomVisible: false,
      },
    };
  }

  componentDidMount() {
    agent.req.get(agent.API_ROOT + '/api/category/').then((response) => {
      let resBody = response.body;
      this.setState({categories: resBody.results, nextURL: resBody.next})
    }).catch((e) => {
    })
  }

  handleUpdate = (e, {calculations}) => {
    this.setState({calculations})
    if (calculations.bottomVisible) {
      if (!!this.state.nextURL) {
        agent.req.get(this.state.nextURL).then((response) => {
          let resBody = response.body;
          let newData = this.state.categories.concat(resBody.results)
          this.setState({categories: newData, nextURL: resBody.next})
        }).catch((e) => {
        })
      }
    }
  }

  render() {
    return (
      <Visibility once={true} onUpdate={this.handleUpdate}>
        <Segment vertical loading={this.props.isLoading}>
          <Container>
            <Grid stackable columns={2}>
              {this.state.categories.map(function (item, i) {
                return (
                  <Link to={'/' + item.id} key={i}>
                    <Grid.Column>
                      <Item.Group>
                        <Item>
                          <Item.Image size='medium'
                                      src={item.img_present}/>
                          <Item.Content verticalAlign='middle'>
                            <Item.Header>
                              {item.name}
                            </Item.Header>
                            <Item.Description>
                              {item.desc}
                            </Item.Description>
                            <Item.Description>
                              <Icon name='file image outline'/>
                              {item.total_images}
                            </Item.Description>
                            <Item.Description>
                              {item.tx}
                            </Item.Description>
                            <Item.Description>
                              {item.contract_address}
                            </Item.Description>
                            <Item.Meta>
                              {item.created}
                            </Item.Meta>
                          </Item.Content>
                        </Item>
                      </Item.Group>
                    </Grid.Column>
                  </Link>
                )
              })}
            </Grid>
          </Container>
        </Segment>
      </Visibility>
    )
  }
}

export default props => (<AuthConsumer>
    {({login, isLoading, isAuth}) => {
      return <Login {...props} login={login} isAuth={isAuth} isLoading={isLoading}/>
    }}
  </AuthConsumer>
)
