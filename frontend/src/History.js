import React from 'react';
import {Grid, Image, Container, Dropdown, Card, Icon, Segment, Item, Visibility} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'


class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      classifies: [],
      nextURL: '',
      calculations: {
        bottomVisible: false,
      },
    };
  }

  handleChange = (image, {value}) => {
    this.setState({value});
    let classify = value;
    agent.req.post(agent.API_ROOT + '/api/image-profile/', {classify, image}).set('authorization', `JWT ${this.props.token}`).type('form').then((response) => {
      let resBody = response.body;
    }).catch((e) => {
    })
  }

  handleUpdate = (e, {calculations}) => {
    this.setState({calculations})
    if (calculations.bottomVisible) {
      if (!!this.state.nextURL) {
        agent.req.get(this.state.nextURL).set('authorization', `JWT ${this.props.token}`).then((response) => {
          let resBody = response.body;
          let newData = this.state.images.concat(resBody.results)
          this.setState({images: newData, nextURL: resBody.next})
        }).catch((e) => {
        })
      }
    }
  }

  componentDidMount() {
    agent.req.get(agent.API_ROOT + '/api/image-profile/').set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
      console.log(resBody);
      this.setState({images: resBody.results, nextURL: resBody.next})
    }).catch((e) => {
    })
  }


  render() {
    let self = this;
    return (
      <Visibility once={true} onUpdate={self.handleUpdate}>
        <Segment vertical>
          <Container>
            <Grid stackable columns={3}>
              {this.state.images.map(function (item, i) {
                return (
                  <Grid.Column key={i}>
                    <Segment vertical>
                      <Image src={item.image_url}/>
                      <h3>{item.category} - {item.classify}</h3>
                    </Segment>
                  </Grid.Column>
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
    {({token, isLoading, isAuth}) => {
      return <History {...props} token={token} isLoading={isLoading} isAuth={isAuth}/>
    }}
  </AuthConsumer>
)
