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
    document.title = 'Data oscar'
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
    if (calculations.direction === "down" & calculations.percentagePassed > 0.3) {
      if (!!this.state.nextURL && this.state.isLoading == false) {
        this.setState({isLoading: true})
        agent.req.get(this.state.nextURL).then((response) => {
          let resBody = response.body;
          this.setState({isLoading: false})
          if (resBody.next != self.state.nextURL) {
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
        <Segment vertical>
          <div className="ui center aligned grid container">
            <div className="row">
              <div className="one wide column"></div>
              <div className="fourteen wide column">
                <h1 style={{fontSize: '3rem'}}>Category list</h1>
                <h1 style={{fontSize: '1.8rem'}}>List of data set.</h1>
                <div className="ui three doubling stackable cards" style={{marginTop: "2em"}}>
                  {this.state.categories.map(function (item, i) {
                    return (
                      <Card href={"/" + item.id}>
                        <Image src={item.img_present}/>
                        <Card.Content>
                        </Card.Content>
                        <Card.Content extra>
                          <p className='date' style={{overflow: 'hidden', color: 'black'}}>Name: {item.name}, Total <Icon
                            name='file image outline'/>: {item.total_images}</p>
                          {!!item.contract_address ?
                            <p className='date' style={{overflow: 'hidden', color: 'black'}}>{item.contract_address}</p>
                            :
                            <p className='date' style={{overflow: 'hidden'}}>Creating</p>
                          }
                          <p className='date'>{item.created}</p>
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
    {({login, isLoading, isAuth}) => {
      return <Login {...props} login={login} isAuth={isAuth} isLoading={isLoading}/>
    }}
  </AuthConsumer>
)
