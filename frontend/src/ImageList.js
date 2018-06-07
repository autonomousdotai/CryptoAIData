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
    this.handleChange = this.handleChange.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.state = {
      isLoading: false,
      img: '',
      images: [],
      classifies: [],
      nextURL: '',
      calculations: {
        bottomVisible: false,
      },
    };
  }

  handleFile(e) {
    const link = e.target.files[0];
    let form = new FormData()
    form.append('link', link)
    form.append('category', this.props.match.params.categoryId)
    console.log('submit image')
    agent.req.post(agent.API_ROOT + '/api/image/', form).set('authorization', `JWT ${this.props.token}`).then((response) => {

      agent.req.get(agent.API_ROOT + '/api/image/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
        let resBody = response.body;
        this.setState({images: resBody.results, nextURL: resBody.next})
      }).catch((e) => {
      })

    }).catch((e) => {
    })
  }

  handleChange = (image, e, value) => {
    let classify = value;
    console.log(image, classify);
    agent.req.post(agent.API_ROOT + '/api/image-profile/', {image, classify})
      .set('authorization', `JWT ${this.props.token}`).type('form').then((response) => {
      let resBody = response.body;
    }).catch((e) => {
    })
  }


  componentDidMount() {
    this.setState({isLoading: true})

    agent.req.get(agent.API_ROOT + '/api/classify/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
      let temp = [];
      for (let i = 0; i < resBody.results.length; i++) {
        temp.push({"text": resBody.results[i].name, "value": resBody.results[i].id})
      }
      this.setState({classifies: temp})
    }).catch((e) => {
    });


    agent.req.get(agent.API_ROOT + '/api/image/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
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
        <Segment vertical>
          <div className="ui center aligned grid container">
            <div className="row">
              <Form>
                <Form.Field>
                    <label>Upload image to this category</label>
                  <input type='file' onChange={this.handleFile} placeholder='First Name'/>
                </Form.Field>
              </Form>
            </div>
            <div className="row">
              <div className="one wide column"></div>
              <div className="fourteen wide column">
                <h1 style={{fontSize: '3rem'}}>List image</h1>
                <div className="ui three doubling stackable cards" style={{marginTop: "2em"}}>
                  {this.state.images.map(function (item, i) {
                    return (
                      <Card key={i}>
                        <Image src={item.link}/>
                        <Card.Content>
                          <Card.Header>{item.name}</Card.Header>
                          <Card.Description>{item.desc}</Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                          <Dropdown onChange={(e, value) => self.handleChange(item.id, e, value.value)}
                                    placeholder='Select classify' fluid selection search
                                    options={self.state.classifies}/>
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
    {({token, isLoading, isAuth}) => {
      return <Login {...props} token={token} isAuth={isAuth} isLoading={isLoading}/>
    }}
  </AuthConsumer>
)
