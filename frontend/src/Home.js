import React from 'react';
import {Grid, Image, Container, Card, Icon, Segment, Item, Visibility} from 'semantic-ui-react'
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
      categories: [],
      nextURL: '',
      calculations: {
        bottomVisible: false,
      },
    };
  }

  componentDidMount() {
    this.setState({isLoading: true})
    agent.req.get(agent.API_ROOT + '/api/category/').then((response) => {
      let resBody = response.body;
      this.setState({isLoading: false})
      this.setState({categories: resBody.results, nextURL: resBody.next})
    }).catch((e) => {
    })
  }

  handleUpdate = (e, {calculations}) => {
    let self = this;
    console.log(calculations)
    console.log(calculations.percentagePassed)
    this.setState({calculations})
    if (calculations.direction === "down" & calculations.percentagePassed  > 0.3) {
      if (!!this.state.nextURL && this.state.isLoading == false) {
        this.setState({isLoading: true})
        agent.req.get(this.state.nextURL).then((response) => {
          let resBody = response.body;
          this.setState({isLoading: false})
          if(resBody.next != self.state.nextURL){
            let newData = this.state.categories.concat(resBody.results)
            this.setState({categories: newData, nextURL: resBody.next})
          }
        }).catch((e) => {
        })
      }
    }
  }

  render() {
    return (
      <Visibility once={true} onUpdate={this.handleUpdate}>
        <Segment vertical loading={this.state.isLoading}>
          <Container>
            <Card.Group centered>
              {this.state.categories.map(function (item, i) {
                return (
                  <Card href={"/" + item.id}>
                    <img src={item.img_present} height="200px"/>
                    <Card.Content>
                      <Card.Header>{item.name}</Card.Header>
                      <Card.Meta>
                        {!!item.contract_address ?
                        <p className='date' style={{overflow: 'hidden'}}>{item.contract_address}</p>
                          :
                          <p className='date' style={{overflow: 'hidden'}}>Creating</p>
                        }
                        <p className='date'>{item.created}</p>
                      </Card.Meta>
                      <Card.Description>{item.desc}</Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <a>
                        <Icon name='file image outline'/>
                        {item.total_images}
                      </a>
                    </Card.Content>
                  </Card>
                )
              })}
            </Card.Group>
          </Container>
        </Segment>
      </Visibility>

    )
  }
}

export default props => (<AuthConsumer>
    {({login, isLoading, isAuth}) => {
      return <Login {...props} login={login} isAuth={isAuth} isLoading={isLoading}/>
    }}
  </AuthConsumer>
)
