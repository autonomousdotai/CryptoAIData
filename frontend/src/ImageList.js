import React from 'react';
import {Grid, Image, Container, Card, Icon, Segment, Item, Visibility} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'


class ImageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
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
        console.log('get next')
        agent.Image.getFullURL(this.state.nextURL).then((response) => {
          let newData = this.state.images.concat(response.results)
          this.setState({images: newData, nextURL: response.next})
        }).catch((e) => {
        })
      }
    }

  }

  componentDidMount() {
    agent.Image.get(this.props.match.params.categoryId).then((response) => {
      this.setState({images: response.results, nextURL: response.next})
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
    {({login, isLoading, isAuth}) => {
      return <ImageList {...props} isAuth={isAuth} isLoading={isLoading}/>
    }}
  </AuthConsumer>
)
