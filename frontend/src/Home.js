import React from 'react';
import {Grid, Image, Container, Card, Icon, Segment, Item, Visibility, Button, Modal, List, Input} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'
import filter from 'lodash.filter'

function LikedIcon(props) {
  if (!props.isAuth) {
    return (
      <Link to="/login">
        <Icon name='heart outline' size='large' />
      </Link>
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

function ClassifiedIcon(props) {
  if (!props.isAuth) {
    return (
      <Link to="/login">
        <Icon name='plus' size='large' />
      </Link>
    );
  }
  if (props.classified) {
    return <Icon name='checkmark' size='large' />;
  }
  return (
    <a href='javascript:void(0);' onClick={props.onClassify}>
      <Icon name='plus' size='large' />
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
      modal: {
        open: false,
        imageIndex: null,
        classifies: [],
        classifyId: null,
        searchableClassfies: []
      },
      token: this.props.token,
    };
    this.handleLikeImage = this.handleLikeImage.bind(this);
    this.handleClassifyImage = this.handleClassifyImage.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleSelectedClassify = this.handleSelectedClassify.bind(this);
    this.submitClassify = this.submitClassify.bind(this);
  }

  init_data(token){
    this.setState({isLoading: true})

    const req = agent.req.get(agent.API_ROOT + '/api/feed/');
    if (this.props.isAuth && token !=undefined) { 
      req.set('authorization', `JWT ${token}`);
    }
    req.then((response) => {
      const body = response.body;
      this.setState({isLoading: false});
      this.setState({images: body.results, nextURL: body.next});
    }).catch((e) => {
    })
  }
  componentDidMount() {
    document.title = 'Data oscar'
    this.init_data(this.props.token);
  }
  componentWillReceiveProps(nextProps) { 
    if(this.state.token == undefined){ 
      this.setState({token: nextProps.token});
      this.init_data(nextProps.token);
    }
  }

  handleUpdate = (e, {calculations}) => {
    let self = this;
    this.setState({calculations})
    if (calculations.direction === "down" & calculations.percentagePassed > 0.3) {
      if (!!this.state.nextURL && this.state.isLoading == false) {
        this.setState({isLoading: true})
        const req  = agent.req.get(this.state.nextURL); 
        if (this.props.isAuth && this.state.token !=undefined) { 
          req.set('authorization', `JWT ${this.props.token}`);
        }

        req.then((response) => {
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
    if (!this.props.isAuth) {
      return;
    }

    e.preventDefault();
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
    if (!this.props.isAuth) {
      return;
    }

    e.preventDefault();
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

  closeModal() {
    const modal = {...this.state.modal};
    modal.open = false;
    modal.imageIndex = null;
    modal.classifyId = null;
    modal.classifies = [];
    this.setState({modal});
  }

  submitClassify() {
    if (!this.state.modal.classifyId) {
      this.closeModal();
      return;
    }

    const imageIndex = this.state.modal.imageIndex;
    const imageId = this.state.images[imageIndex].id;
    const classifyId = this.state.modal.classifyId;
    agent.req.post(agent.API_ROOT + '/api/image-profile/', {image: imageId, classify: classifyId})
      .set('authorization', `JWT ${this.props.token}`).type('form').then((response) => {
        const images = this.state.images.slice();
        images[imageIndex].classified = true;
        this.setState({images});

        this.closeModal();
    }).catch((e) => {
    })
  }

  handleSelectedClassify(classifyId) {
    const modal = {...this.state.modal};
    modal.searchableClassfies.forEach(function(c) {
      if (c.value === classifyId) {
        if (c.active) {
          c.active = false;
          c.content = <List.Content>{c.text}</List.Content>;
          modal.classifyId = null;
        } else {
          c.active = true;
          c.content = (
            <List.Content>
              <List.Content floated='right'>
                <Icon name='checkmark' />
              </List.Content>
              <List.Content>
                {c.text}
              </List.Content>
            </List.Content>
          );
          modal.classifyId = classifyId;
        }
      } else {
        c.active = false;
        c.content = <List.Content>{c.text}</List.Content>;
      }
    });
    this.setState({modal});
  }

  handleClassifyImage(e, i) {
    e.preventDefault();
    
    const searchableClassfies = [];
    agent.req.get(agent.API_ROOT + `/api/classify/?category=${this.state.images[i].category.id}&limit=50`).set('authorization', `JWT ${this.props.token}`).then((response) => {
      const resBody = response.body;
      for (let i = 0; i < resBody.results.length; i++) {
        searchableClassfies.push({
          content: <List.Content>{resBody.results[i].name}</List.Content>,
          text: resBody.results[i].name,
          value: resBody.results[i].id,
          active: false
        });
      }

      const modal = {...this.state.modal};
      modal.open = true;
      modal.imageIndex = i;
      modal.classifies = searchableClassfies;
      modal.searchableClassfies = searchableClassfies;
      this.setState({modal});
    }).catch((e) => {
    });
  }

  handleModalSearch(text) {
    const modal = {...this.state.modal};
    if (!text) {
      modal.searchableClassfies = modal.classifies;
      this.setState({modal});
      return;
    }

    const re = new RegExp(text, 'i');
    const isMatch = result => re.test(result.text);
    modal.searchableClassfies = filter(modal.classifies, isMatch);
    this.setState({modal});
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

  renderClassifiedIcon(i) {
    return (
      <ClassifiedIcon
        isAuth={this.props.isAuth}
        classified={this.state.images[i].classified}
        onClassify={e => this.handleClassifyImage(e, i)}
      />
    );
  }

  render() {
    return (
      <Visibility once={true} onUpdate={this.handleUpdate}>
        <Segment vertical>
          <div className="ui center aligned grid container">
            <div className="row">
              <div className="fourteen wide column">
                <div className="ui three doubling stackable cards" style={{marginTop: "1em"}}>
                  {this.state.images.map((item, i) => {
                    return (
                      <Card key={i}>
                        <Link to={"/cat/" + item.category.id}>
                          <Image src={item.link}/>
                         </Link>
                        <Card.Content>
                          <div style={{float: 'left'}}>
                            <a href={'/cat/' + item.category.id}>{item.category.name}</a>
                          </div>
                          <div style={{float: 'right'}}>
                            <div style={{display: 'inline', marginRight: '2em'}}>
                              {this.renderLikedIcon(i)}
                            </div>
                            <div style={{display: 'inline'}}>
                              {this.renderClassifiedIcon(i)}
                            </div>
                          </div>
                        </Card.Content>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
            <div>
              <Modal size='large'closeOnEscape closeIcon open={this.state.modal.open} onClose={this.closeModal} style={{height: '90%'}}>
                <Modal.Header>Choose classify</Modal.Header>
                <Modal.Content style={{height: '80%', overflowY: 'scroll'}}>
                  {/*<Input fluid onChange={(e, data) => this.handleModalSearch(data.value)} icon='search' placeholder='Search classify...' />*/}
                  <List divided selection items={this.state.modal.searchableClassfies} onItemClick={(e, data) => this.handleSelectedClassify(data.value)} />
                </Modal.Content>
                <Modal.Actions>
                  <Button fluid positive content='Done' onClick={this.submitClassify} style={{marginLeft: 0}} />
                </Modal.Actions>
              </Modal>
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
