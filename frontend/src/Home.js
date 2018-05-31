import React from 'react';
import {Grid, Image, Container, Card, Icon, Segment, Item} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'


class Login extends React.Component {
  state = {categories: []}

  componentDidMount() {
    agent.Category.get().then((response) => {
      console.log(response.results)
      this.setState({categories: response.results})
    }).catch((e) => {
      console.log(e)
    })
  }

  render() {
    return (
      <Segment vertical loading={this.props.isLoading}>
        <Container>
          <Grid stackable columns={2}>
            {this.state.categories.map(function (item, i) {
              return (
                <Grid.Column key={i}>
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
                        <Item.Meta>
                          {item.created}
                        </Item.Meta>
                      </Item.Content>
                    </Item>
                  </Item.Group>
                </Grid.Column>
              )
            })}
          </Grid>
        </Container>
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
