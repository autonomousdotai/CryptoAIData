import React from 'react';
import {Grid, Image, Container, Dropdown, Card, Icon, Segment, Item, Visibility} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'


class ImageList extends React.Component {
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
    agent.req.get(agent.API_ROOT + '/api/classify/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
      console.log(resBody)
      let temp = [];
      for(let i = 0; i < resBody.results.length; i++){
        temp.push({"text": resBody.results[i].name, "value": resBody.results[i].id})
      }
      this.setState({classifies: temp})
    }).catch((e) => {
    })

    agent.req.get(agent.API_ROOT + '/api/image/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
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
                      <Image src={item.link}/>
                      <Dropdown placeholder='Select Friend' fluid selection options={self.state.classifies} />
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
      return <ImageList {...props} token={token} isLoading={isLoading} isAuth={isAuth}/>
    }}
  </AuthConsumer>
)
