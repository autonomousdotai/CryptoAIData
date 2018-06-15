import React from 'react';
import {Grid, Image, Container, Card, Icon, Segment, Item, Visibility, Button} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'


class Explore extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.state = {
      isLoading: false,
      // categories: [],
      images: [],
      nextURL: '',
      calculations: {
        bottomVisible: false,
      },
    };
    this.handleLikeImage = this.handleLikeImage.bind(this);
    this.handleClassifyImage = this.handleClassifyImage.bind(this);
  }

  componentDidMount() {
    document.title = 'Data oscar'
    this.setState({isLoading: true})

    const req = agent.req.get(agent.API_ROOT + '/api/category/');
    if (this.props.isAuth) {
      req.set('authorization', `JWT ${this.props.token}`);
    }
    req.then((response) => {
      const body = response.body;
      console.log(body);

      this.setState({isLoading: false});
      this.setState({images: body.results, nextURL: body.next});
    }).catch((e) => {
    })
  }

  handleUpdate = (e, {calculations}) => {
    let self = this;
    this.setState({calculations})
    if (calculations.direction === "down" & calculations.percentagePassed > 0.3) {
      if (!!this.state.nextURL && this.state.isLoading == false) {
        this.setState({isLoading: true})
        agent.req.get(this.state.nextURL).then((response) => {
          let resBody = response.body;
          this.setState({isLoading: false})
          if (resBody.next != self.state.nextURL) {
            let newData = this.state.images.concat(resBody.results)
            this.setState({images: newData, nextURL: resBody.next})
          }
        }).catch((e) => {
        })
      }
    }
  }

  handleLikeImage(e, imageId) {
    e.preventDefault();

    if (!this.props.isAuth) {
      // redirect to login page
      return;
    }

    agent.req.post(agent.API_ROOT + '/api/image-profile/like/')
      .send({ image: imageId })
      .set('authorization', `JWT ${this.props.token}`)
      .set('accept', 'application/json')
      .then((resp) => {
        console.log(resp)
      })
      .catch((err) => {
      });
  }

  handleClassifyImage(e, categoryId) {
    e.preventDefault();
    console.log(categoryId)
    // agent.req.get('/api/classify/?category_id=' + )
  }

  render() {
    return (
      <Visibility once={true} onUpdate={this.handleUpdate}>
        <Segment vertical>
          <div className="ui center aligned grid container">
            <div className="row">
              <div className="one wide column"></div>
              <div className="fourteen wide column">
                <div className="ui three doubling stackable cards" style={{marginTop: "1em"}}>
                  {this.state.images.map((item, i) => {
                    let icon;
                    if (item.liked) {
                      icon = <Icon name='heart' size='large' />;
                    } else {
                      icon = <a href='javascript:void(0);' onClick={(e) => this.handleLikeImage(e, item.id)}>
                                  <Icon name='heart outline' size='large' />
                             </a>
                    }
                    return (
                      <Card href={"/image/" + item.id} key={i}>
                        <Image src={item.img_present}/>
                        <Card.Content>
                          <div style={{float: 'left'}}>
                            <a href={'/category/' + item.id}>{item.name}</a>
                          </div>
                          <div style={{float: 'right'}}>
                            <div style={{display: 'inline', marginRight: '2em'}}>
                              {icon}
                            </div>
                            <div style={{display: 'inline'}}>
                              <a href='javascript:void(0)' onClick={(e) => this.handleClassifyImage(e, item.id)}>
                                <Icon name='plus' size='large' />
                              </a>
                            </div>
                          </div>
                        </Card.Content>
                      </Card>
                    )
                  })}
                </div>
              </div>
              <div className="one wide column"></div>
            </div>
          </div>
        </Segment>
        <Segment vertical loading={this.state.isLoading}/>
      </Visibility>

    )
  }
}

export default props => (<AuthConsumer>
    {({login, token, isLoading, isAuth}) => {
      return <Explore {...props} login={login} isAuth={isAuth} isLoading={isLoading} token={token} />
    }}
  </AuthConsumer>
)
