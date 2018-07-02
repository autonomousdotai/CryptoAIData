import React from 'react';
import {Grid, Menu, Modal,List, Image, Container, Transition, Card, Icon, Segment, Item, Visibility, Button} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'


import {iosHeartOutline, iosCopyOutline, iosHeart, iosCheckmarkOutline,  iosPlusOutline} from 'react-icons-kit/ionicons'
import { withBaseIcon } from 'react-icons-kit'
const SideIconContainer =  withBaseIcon({ size:20})

const inlineStyle = {
  modal : {
    marginTop: '0px !important',
    marginLeft: 'auto',
    marginRight: 'auto',
    width:'80%',
  }
};

function ImageGrid(props) {
  if (props.displayImages.length <=2 ) {
    return (
      <Image src={props.displayImages[0]} />
    );
  }

  return (
    <div>
        <Grid columns={1} padded>
        <Grid.Column fluid>
            <Image src={props.displayImages[0]} className="fistgridimage" />
         </Grid.Column>
        </Grid>
        <Grid columns={2} padded>
          <Grid.Column fluid>
           <Image src={props.displayImages[1]} /> 
          </Grid.Column>
          <Grid.Column fluid>
           <Image src={props.displayImages[2]} /> 
          </Grid.Column>
        </Grid> 
     </div>
  );
}

function LikedIcon(props) {
  if (!props.isAuth) {
    return (
      <Link to="/login" style={{color:'#333'}}>
        <img class="my-icon" src="/icons/activity.svg"/>
      </Link>
    );
  }
  if (props.followed) {
    return (
      <a href='javascript:void(0);' style={{color:'#333'}} onClick={props.onUnfollow}>
        <img class="my-icon" src="/icons/activityactive.svg"/>
      </a>
    );
  }
  return (
    <a href='javascript:void(0);'style={{color:'#333'}} onClick={props.onFollow}>
      <img class="my-icon" src="/icons/activity.svg"/>
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

    const req = agent.req.get(agent.API_ROOT + '/api/explore-category/');
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
        <Container>
            <Menu horizontal id="explore-menu">
               <Menu.Item name="cars" active="cars">Cars  </Menu.Item>
               <Menu.Item>Trash </Menu.Item>
               <Menu.Item>Girl </Menu.Item>
               <Menu.Item>Faces </Menu.Item>
            </Menu>
            <Card.Group centered style={{ marginTop:"20px" }} >
                  {this.state.categories.map((cat, i) => {
                    return (
                      <Card key={i} className="my-card"> 
                        <Link className="ui image" to={'/cat/' + cat.id}>
                            {/* <ImageGrid displayImages={cat.display_images} />  className="fistgridimage"  */}
                            <Image src={cat.display_images[0]}/>
                        </Link> 
                        <Card.Content style={{marginBottom: '10px'}}> 
                          <div style={{float: 'left', marginTop:'-8px'}}>
                            <p  className="title">{cat.total_images * 0.001} ETH</p>
                            <p  style={{color:'#232323' , opacity:'0.4'}}>{cat.total_images} images</p>
                          </div> 
                          <div style={{float: 'right',marginTop:'-8px' }}> 
                              <div style={{display: 'inline'}}>
                               {this.renderLikedIcon(i)}
                              </div>
                            <div style={{display: 'inline'}}>
                               <Button onClick={()=>this.showQR(cat)}  size="mini" basic color='black' className="my-btn-buy-eth">Buy ETH</Button>
                            </div>
                          </div> 
                        </Card.Content>
                      </Card>
                    )
                  })} 
               </Card.Group>
            </Container>         
        </Segment>
        <Segment vertical loading={this.state.isLoading}/>
         
          <Modal  animation="fly up" duration="1699" dimmer="inverted" size="mini" open={this.state.open}
                onClose={this.close} style={inlineStyle.modal}>
                  <Modal.Content>
                    <h3 style={{fontFamily: 'Roboto',lineHeight:'1em', opacity:0.7, marginBottom:'0.5em', fontWeight:'normal', fontSize:'18px', textAlign:'center',color:'#262628'}}>Receive</h3>
                    <h3 style={{fontFamily: 'Roboto', lineHeight:'1em', opacity:0.7, fontWeight:'normal',margin:'0',fontSize:'24px', textAlign:'center',color:'#2ED573'}}>{this.state.choice_address.total_images * 0.001} ETH</h3> 
                    <Image src={"https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl="+this.state.choice_address.contract_address+"&choe=UTF-8"}/>
                    {/* <p><span><SideIconContainer SideIconContainer icon={iosCopyOutline}/> {this.state.choice_address} </span></p> */}
                    {/* <p><Button onClick={this.Copy.bind(this, this.state.choice_address)} color='blue'> <Icon name='copy' /> copy address</Button></p> */}
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
