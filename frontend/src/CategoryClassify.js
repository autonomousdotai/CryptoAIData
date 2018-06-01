import React from 'react';
import {Grid, Image, Container, Form, Card, Icon, Segment, Item, Button, List, Transition} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'


class CategoryClassify extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      images: [],
      values: [''],
      categoryName: '',
    };
  }

  componentDidMount() {

  }

  createUI() {
    return this.state.values.map((el, i) =>
      <div className="two fields" key={i}>
        <div className="field">
          <input className='ui input' placeholder='Classify' type="text" value={el || ''}
                 onChange={this.handleChange.bind(this, i)}/>
        </div>
        <div className="field">
          <input className='ui button' type='button' value='Remove' onClick={this.removeClick.bind(this, i)}/>
        </div>
      </div>
    )
  }

  removeClick(i) {
    let values = [...this.state.values];
    values.splice(i, 1);
    this.setState({values});
  }

  handleChangeInput = (e, {name, value}) => this.setState({[name]: value})

  handleChange(i, event) {
    let values = [...this.state.values];
    values[i] = event.target.value;
    this.setState({values});

    if (values[i].length == 1 && i == this.state.values.length - 1) {
      this.setState(prevState => ({values: [...prevState.values, '']}))
    }
  }

  handleSubmit(event) {
    let self = this;
    // alert('A name was submitted: ' + this.state.values.join(', '));
    console.log(this.state);
    event.preventDefault();

    let name = this.state.categoryName;
    agent.req.post(agent.API_ROOT + '/api/category/', {name}).set('authorization', `JWT ${this.props.token}`).type('form').then((response) => {
      let resBody = response.body;
      console.log(resBody);
      let category = resBody.id;

      for (let i = 0; i < self.state.values.length; i++) {
        let name = self.state.values[i];
        if (!!name) {
          agent.req.post(agent.API_ROOT + '/api/classify/', {
            category,
            name
          }).set('authorization', `JWT ${this.props.token}`).type('form').then((response) => {
            let resBody = response.body;
          }).catch((e) => {
          })
        }
      }


    }).catch((e) => {
    })
  }

  render() {
    let self = this;
    return (
      <Segment vertical>
        <Container>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group widths='equal'>
              <Form.Input placeholder='Category' name='categoryName' value={this.state.categoryName}
                          onChange={this.handleChangeInput}/>
            </Form.Group>
            {
              this.createUI()
            }
            <Form.Button primary content='Submit' size='large'/>
          </Form>
        </Container>
      </Segment>
    )
  }
}

export default props => (<AuthConsumer>
    {({token, isLoading, isAuth}) => {
      return <CategoryClassify {...props} token={token} isLoading={isLoading} isAuth={isAuth}/>
    }}
  </AuthConsumer>
)
