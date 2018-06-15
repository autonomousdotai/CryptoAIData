import React from 'react';
import {Grid, Image, Container, Card, Icon, Segment, Item, Visibility, Button} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'

function LikedIcon(props) {
  if (!props.isAuth) {
    return (
      <Icon name='heart outline' size='large' />
    );
  }
  if (props.liked) {
    return (
        <a href='javascript:void(0);' onClick={props.onUnlike}>
          <Icon name='heart' size='large' />
        </a>
    );
  }
  return (
      <a href='javascript:void(0);' onClick={props.onLike}>
        <Icon name='heart outline' size='large' />
      </a>
  );
}

class Login extends React.Component {
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

    const req = agent.req.get(agent.API_ROOT + '/api/feed/');
    if (this.props.isAuth) {
      req.set('authorization', `JWT ${this.props.token}`);
    }
    req.then((response) => {
      const body = response.body;
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

  handleLikeImage(e, i) {
    e.preventDefault();

    if (!this.props.isAuth) {
      // window.location.href = '/login';
      return <Redirect to="/login" />;
    }

    const id = this.state.images[i].id;

    agent.req.post(agent.API_ROOT + '/api/image-profile/like/')
      .send({ image: id })
      .set('authorization', `JWT ${this.props.token}`)
      .set('accept', 'application/json')
      .then((resp) => {
        const images = this.state.images.slice();
        images[i].liked = true;
        this.setState({images});
      })
      .catch((err) => {
      });
  }

  handleUnlikeImage(e, i) {
    e.preventDefault();

    if (!this.props.isAuth) {
      // window.location.href = '/login';
      return <Redirect to="/login" />;
    }

    const id = this.state.images[i].id;

    agent.req.del(agent.API_ROOT + '/api/image-profile/unlike/')
      .send({ image: id })
      .set('authorization', `JWT ${this.props.token}`)
      .set('accept', 'application/json')
      .then((resp) => {
        const images = this.state.images.slice();
        images[i].liked = false;
        this.setState({images});
      })
      .catch((err) => {
      });
  }

  handleClassifyImage(e, categoryId) {
    e.preventDefault();
    console.log(categoryId)
    // agent.req.get('/api/classify/?category_id=' + )
  }

  renderLikedIcon(i) {
    return (
      <LikedIcon
        isAuth={this.props.isAuth}
        liked={this.state.images[i].liked}
        onLike={e => this.handleLikeImage(e, i)}
        onUnlike={e => this.handleUnlikeImage(e, i)}
      />
    );
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
                    return (
                      <Card href={"/image/" + item.id} key={i}>
                        <Image src={item.link}/>
                        <Card.Content>
                          <div style={{float: 'left'}}>
                            <a href={'/category/' + item.category.id}>{item.category.name}</a>
                          </div>
                          <div style={{float: 'right'}}>
                            <div style={{display: 'inline', marginRight: '2em'}}>
                              {this.renderLikedIcon(i)}
                            </div>
                            <div style={{display: 'inline'}}>
                              <a href='javascript:void(0)' onClick={(e) => this.handleClassifyImage(e, item.category.id)}>
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
      return <Login {...props} login={login} isAuth={isAuth} isLoading={isLoading} token={token} />
    }}
  </AuthConsumer>
)
