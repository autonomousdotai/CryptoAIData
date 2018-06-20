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
      open:false,
      choice_address:"",

    };
    this.handleLikeImage = this.handleLikeImage.bind(this);
    this.handleClassifyImage = this.handleClassifyImage.bind(this);
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
              <div className="fourteen wide column">
                <div className="ui three doubling stackable cards" style={{marginTop: "1em"}}>
                  {this.state.images.map((item, i) => {
                    let icon;
                    if (item.liked) {
                      icon = <Icon name='heart' size='large' />;
                    } else {
                      icon = <a href='javascript:void(0);' onClick={(e) => this.handleLikeCategory(e, item.id)}>
                                  <Icon name='heart outline' size='large' />
                             </a>
                    }
                    return (
                      
                        <Card key={i}>
                            <Link to={"/cat/" + item.id}>
                                <Image src={item.img_present}/>
                            </Link>
                            <Card.Content>
                              <div style={{float: 'left'}}>
                                <p><a href={'/category/' + item.id}>{item.name}</a></p>
                                <p> { "Images " + item.total_images} </p>
                              </div>
                              <div style={{float: 'right', marginTop:17}}>
                                <div style={{display: 'inline', marginRight: '2em'}}>
                                  {icon}
                                </div>
                                <div style={{display: 'inline'}}>
                                        <Button basic color='blue' onClick={this.showQR.bind(this,item.contract_address)} content='Buy' />   
                                </div>
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
