import React from 'react';
import {Grid, Image, Container, Card, Icon, Segment} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'


class Login extends React.Component {
  state = {categories: []}

  componentDidMount() {
    agent.Category.list().then((response) => {
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
          <Grid stackable columns={4}>
            {this.state.categories.map(function (item, i) {
              return (
                <Grid.Column key={i}>
                  <Card>
                    <Image src='https://react.semantic-ui.com/assets/images/wireframe/image.png'/>
                    <Card.Content>
                      <Card.Header>
                        {item.name}
                      </Card.Header>
                      <Card.Meta>
                        <span className='date'>
                          {item.created}
                        </span>
                      </Card.Meta>
                      <Card.Description>
                        {item.desc}
                      </Card.Description>
                      <Card.Description>
                        {item.total_images}
                      </Card.Description>
                    </Card.Content>
                  </Card>
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
