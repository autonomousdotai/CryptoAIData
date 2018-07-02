import React from 'react';
import {Grid, Image, Container, Card, Form, Segment, Dropdown, Visibility} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'


class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.state = {
      isLoading: false,
      img: '',
      images: [],
      nextURL: '',
      calculations: {
        bottomVisible: false,
      },
    };
  }

  componentDidMount() {
    this.setState({isLoading: true})
    agent.req.get(agent.API_ROOT + '/api/image-profile/').set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
      this.setState({isLoading: false})
      this.setState({images: resBody.results, nextURL: resBody.next})
    }).catch((e) => {
    })
  }

  handleUpdate = (e, {calculations}) => {
    let self = this;
    console.log(calculations)
    console.log(calculations.percentagePassed)
    this.setState({calculations})
    if (calculations.direction === "down" & calculations.percentagePassed > 0.3) {
      if (!!this.state.nextURL && this.state.isLoading == false) {
        this.setState({isLoading: true})
        agent.req.get(this.state.nextURL).set('authorization', `JWT ${this.props.token}`).then((response) => {
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

  render() {
    let self = this;
    return (
      <Visibility once={true} onUpdate={this.handleUpdate}>
        <Segment vertical loading={this.state.isLoading}>
        <Container> 
                {this.state.images.length == 0 ?
                  <h1>No image classified, Go Home or Explore to classified and earn reward.</h1>
                  :
                  <Card.Group centered>
                  {this.state.images.map(function (item, i) {
                      return (
                        <Card key={i}  className="my-card">
                           <Link className="ui image" to="#" >
                            <Image src={item.image_url}/>
                        </Link>   
                          <Card.Content  style={{marginBottom: '10px'}}>
                            <div style={{float: 'left', marginTop:'-8px'}}>
                              <p  className="title">{item.category_name}</p>
                              <p  style={{color:'#232323' , opacity:'0.4'}}> {item.classify_name}</p>
                            </div>  
                          </Card.Content>
                        </Card>
                      )
                    })} 
                   </Card.Group> 
                }
              </Container> 
        </Segment> 
      </Visibility>

    )
  }
}

export default props => (<AuthConsumer>
    {({token, isLoading, isAuth}) => {
      return <Login {...props} token={token} isAuth={isAuth} isLoading={isLoading}/>
    }}
  </AuthConsumer>
)
