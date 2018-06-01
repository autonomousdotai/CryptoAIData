import React from 'react';
import {Grid, Image, Container, Dropdown, Button, Form, Segment, Item, Visibility} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'


class ImageList extends React.Component {
  constructor(props) {
    super(props);
    this.handleFile = this.handleFile.bind(this);
    this.state = {
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

  handleChange = (image, {value}) => {
    this.setState({value});
    let classify = value;
    agent.req.post(agent.API_ROOT + '/api/image-profile/', {
      classify,
      image
    }).set('authorization', `JWT ${this.props.token}`).type('form').then((response) => {
      let resBody = response.body;
    }).catch((e) => {
    })
  }

  handleUpdate = (e, {calculations}) => {
    this.setState({calculations})
    if (calculations.bottomVisible) {
      if (!!this.state.nextURL) {
        agent.req.get(this.state.nextURL).set('authorization', `JWT ${this.props.token}`).then((response) => {
          let resBody = response.body;
          let newData = this.state.images.concat(resBody.results)
          this.setState({images: newData, nextURL: resBody.next})
        }).catch((e) => {
        })
      }
    }
  }

  componentDidMount() {
    agent.req.get(agent.API_ROOT + '/api/classify/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
      let temp = [];
      for (let i = 0; i < resBody.results.length; i++) {
        temp.push({"text": resBody.results[i].name, "value": resBody.results[i].id})
      }
      this.setState({classifies: temp})
    }).catch((e) => {
    })

    agent.req.get(agent.API_ROOT + '/api/image/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
      this.setState({images: resBody.results, nextURL: resBody.next})
    }).catch((e) => {
    })
  }


  render() {
    let self = this;
    return (
      <Visibility once={true} onUpdate={self.handleUpdate}>
        <Form>
          <Form.Field>
            <input type='file' onChange={this.handleFile} placeholder='First Name'/>
          </Form.Field>
        </Form>
        <Segment vertical>
          <Container>
            <Grid stackable columns={3}>
              {this.state.images.map(function (item, i) {
                return (
                  <Grid.Column key={i}>
                    <Segment vertical>
                      <Image src={item.link}/>
                      <Dropdown onChange={self.handleChange.bind(self, item.id)}
                                placeholder='Select classify' fluid selection search options={self.state.classifies}/>
                    </Segment>
                  </Grid.Column>
                )
              })}
            </Grid>
          </Container>
        </Segment>
      </Visibility>
    )
  }
}

export default props => (<AuthConsumer>
    {({token, isLoading, isAuth}) => {
      return <ImageList {...props} token={token} isLoading={isLoading} isAuth={isAuth}/>
    }}
  </AuthConsumer>
)
