import React from 'react';
import {Grid, Modal, Image, Container, Card, Icon, Segment, Item, Visibility, Button} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'

const inlineStyle = {
  modal : {
    marginTop: '0px !important',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};

function ImageGrid(props) {
  if (props.displayImages.length === 1) {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <Image src={props.displayImages[0]} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <Image src={props.displayImages[0]} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <Image src={props.displayImages[1]} />
        </Grid.Column>
        <Grid.Column>
          <Image src={props.displayImages[2]} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

function LikedIcon(props) {
  if (!props.isAuth) {
    return (
      <Link to="/login">
        <Icon name='heart outline' size='large' />
      </Link>
    );
  }
  if (props.followed) {
    return (
      <a href='javascript:void(0);' onClick={props.onUnfollow}>
        <Icon name='heart' size='large' />
      </a>
    );
  }
  return (
    <a href='javascript:void(0);' onClick={props.onFollow}>
      <Icon name='heart outline' size='large' />
    </a>
  );
}

class Explore extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.state = {
      isLoading: false,
      categories: [],
      nextURL: '',
      calculations: {
        bottomVisible: false,
      },
      open:false,
      choice_address:"",

    };
  }

  show = size => () => this.setState({ size, open: true })
  close = () => this.setState({ open: false })

  Copy(item){
    console.log("copy",item);
    const el = document.createElement('textarea');
    el.value = item;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert("Copped!");
  }

  showQR(item){
    console.log(item);
    //this.setState({ choice_address: item.address ,  open: true })
    this.setState({ choice_address: item, open: true })
    //this.Copy(item);
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
      this.setState({categories: body.results, nextURL: body.next});
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

  handleFollowCategory(e, i) {
    if (!this.props.isAuth) {
      return;
    }

    e.preventDefault();
    const id = this.state.categories[i].id;

    agent.req.post(agent.API_ROOT + '/api/profile-category/follow/')
      .send({ category: id })
      .set('authorization', `JWT ${this.props.token}`)
      .set('accept', 'application/json')
      .then((resp) => {
        const categories = this.state.categories.slice();
        categories[i].followed = true;
        this.setState({categories});
      })
      .catch((err) => {
      });
  }

  handleUnfollowCategory(e, i) {
    if (!this.props.isAuth) {
      return;
    }

    e.preventDefault();
    const id = this.state.categories[i].id;

    agent.req.del(agent.API_ROOT + '/api/profile-category/unfollow/')
      .send({ category: id })
      .set('authorization', `JWT ${this.props.token}`)
      .set('accept', 'application/json')
      .then((resp) => {
        const categories = this.state.categories.slice();
        categories[i].followed = false;
        this.setState({categories});
      })
      .catch((err) => {
      });
  }

  renderLikedIcon(i) {
    return (
      <LikedIcon
        isAuth={this.props.isAuth}
        followed={this.state.categories[i].followed}
        onFollow={e => this.handleFollowCategory(e, i)}
        onUnfollow={e => this.handleUnfollowCategory(e, i)}
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
                <div className="ui two doubling stackable cards" style={{marginTop: "1em"}}>
                  {this.state.categories.map((cat, i) => {
                    return (
                      <Card key={i}>
                        <Card.Content>
                          <ImageGrid displayImages={cat.display_images} />
                        </Card.Content>
                        <Card.Content>
                          <div style={{float: 'left'}}>
                            <a href={'/cat/' + cat.id}>{cat.name} ({cat.total_images} images)</a>
                          </div>
                          <div style={{float: 'right'}}>
                            {this.renderLikedIcon(i)}
                          </div>
                        </Card.Content>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </Segment>
        <Segment vertical loading={this.state.isLoading}/>

          <Modal dimmer="inverted" size="small" open={this.state.open}
                onClose={this.close} style={inlineStyle.modal}>
                  <Modal.Header>{"Deposit ETH to buy data"   }</Modal.Header>
                  <Modal.Content>
                    <Image src={"https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl="+this.state.choice_address+"&choe=UTF-8"}/>
                    <h3>Your wallet address is : </h3>
                    <p>{this.state.choice_address} </p>
                    <p><Button onClick={this.Copy.bind(this, this.state.choice_address)} color='blue'> <Icon name='copy' /> copy address</Button></p>
                    <h3>Send only ETH to your address.</h3>
                  </Modal.Content>
        </Modal>
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
