import React from 'react';
import {Grid, Image, Container, Card, Form, Segment, Dropdown, Visibility, Icon, Modal, Button} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types';

const propTypes = {
  baseColor: PropTypes.string,
  activeColor: PropTypes.string
},

defaultProps = {
  baseColor: 'gray',
  activeColor: 'green',
  overlayColor: 'rgba(255,255,255,0.3)'
};

class FileUploader extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.state = {
      isLoading: false,
      uploading: false,
      img: '',
      images: [],
      classifies: [],
      nextURL: '',
      calculations: {
        bottomVisible: false,
      },
      active: false,
      imageSrc: '',
      loaded: false,
      categories: [],
      selectedCategory: null,
      selectedClassify: null
    };

    this.onDragEnter  = this.onDragEnter.bind(this);
    this.onDragLeave  = this.onDragLeave.bind(this);
    this.onDrop       = this.onDrop.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  handleFile(e) {
    // const link = e.target.files[0];
    // let form = new FormData()
    // form.append('link', link)
    // form.append('category', this.props.match.params.categoryId)
    // console.log('submit image')
    // agent.req.post(agent.API_ROOT + '/api/image/', form).set('authorization', `JWT ${this.props.token}`).then((response) => {

    //   agent.req.get(agent.API_ROOT + '/api/image/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
    //     let resBody = response.body;
    //     this.setState({images: resBody.results, nextURL: resBody.next})
    //   }).catch((e) => {
    //   })

    // }).catch((e) => {
    // })
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

    agent.req.get(agent.API_ROOT + '/api/category/').set('authorization', `JWT ${this.props.token}`).then((response) => {
      const body = response.body;
      const categories = [];
      body.results.forEach(function(c) {
        categories.push({text: c.name, value: c.id})
      })
      this.setState({categories, classifies: [], loading: false});
    })

    // let categoryId = 1; //this.props.match.params.categoryId
    // agent.req.get(agent.API_ROOT + '/api/classify/?category=' + categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
    //   let resBody = response.body;
    //   let temp = [];
    //   for (let i = 0; i < resBody.results.length; i++) {
    //     temp.push({"text": resBody.results[i].name, "value": resBody.results[i].id})
    //   }
    //   this.setState({classifies: temp})
    //   this.setState({isLoading: false})
    // }).catch((e) => {
    // });


    // agent.req.get(agent.API_ROOT + '/api/image/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
    //   let resBody = response.body;
    //   this.setState({isLoading: false})
    //   this.setState({images: resBody.results, nextURL: resBody.next})
    // }).catch((e) => {
    // })
  }

  handleSelectCategory(catId) {
    this.setState({isLoading: true})

    agent.req.get(agent.API_ROOT + '/api/classify/?category=' + catId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      const body = response.body;
      const classifies = [];
      body.results.forEach(function(c) {
        classifies.push({text: c.name, value: c.id})
      })
      this.setState({classifies, selectedCategory: catId, loading: false});
    })
  }

 handleSelectClassify(classifyId) {
    this.setState({selectedClassify: classifyId})
  }

  handleUpdate = (e, {calculations}) => {
    let self = this;
    console.log(calculations)
    console.log(calculations.percentagePassed)
    this.setState({calculations})

    // if (calculations.direction === "down" & calculations.percentagePassed > 0.3) {
    //   if (!!this.state.nextURL && this.state.isLoading == false) {
    //     this.setState({isLoading: true})
    //     agent.req.get(this.state.nextURL).set('authorization', `JWT ${this.props.token}`).then((response) => {
    //       let resBody = response.body;
    //       this.setState({isLoading: false})
    //       if (resBody.next != self.state.nextURL) {
    //         let newData = this.state.images.concat(resBody.results)
    //         this.setState({images: newData, nextURL: resBody.next})
    //       }
    //     }).catch((e) => {
    //     })
    //   }
    // }

  }

  onDragEnter(e) {
    this.setState({ active: true });
  }

  onDragLeave(e) {
    this.setState({ active: false });
  }

  onDragOver(e) {
    e.preventDefault();
  }

  onDrop(e) {
    e.preventDefault();
    this.setState({ active: false });
    this.onFileChange(e, e.dataTransfer.files[0]);
  }

  handleUpload() {
    if (!this.state.selectedCategory) {
      alert('Category is required')
      return
    }
    let form = new FormData()
    form.append('link', this.refs.input.files[0])
    form.append('category', this.state.selectedCategory) // this.props.match.params.categoryId)
    if (this.state.selectedClassify) {
      form.append('classify', this.state.selectedClassify)
    }
    this.setState({uploading: true})
    agent.req.post(agent.API_ROOT + '/api/image/', form).set('authorization', `JWT ${this.props.token}`).then((response) => {
      this.setState({uploading: false})
      this.props.handleClose();
    }).catch((e) => {
    })
  }

  onFileChange(e, file) {
    var file = file || e.target.files[0],
        pattern = /image-*/,
        reader = new FileReader();

    if (!file.type.match(pattern)) {
        alert('Invalid format');
        return;
    }

    this.setState({ loaded: false });

    reader.onload = (e) => {
      console.log(reader)
        this.setState({
            imageSrc: reader.result,
            loaded: true
        });
    }

    reader.readAsDataURL(file);
    var logo = document.getElementById('uploadedImg');
    logo.src = reader.result;

    // let categoryId = 1;
    //
    // let form = new FormData()
    // form.append('link', file)
    // form.append('category',categoryId) // this.props.match.params.categoryId)
    // console.log('submit image')
    // agent.req.post(agent.API_ROOT + '/api/image/', form).set('authorization', `JWT ${this.props.token}`).then((response) => {
    //     console.log(response.body);
    //     this.setState({images: response.body})
    // }).catch((e) => {
    // })
  }

  getFileObject() {
    return this.refs.input.files[0];
  }

  getFileString() {
    return this.state.imageSrc;
  }

  render() {
    let state = this.state,
    props = this.props,
    labelClass  = `uploader ${state.loaded && 'loaded'}`,
    borderColor = state.active ? props.activeColor : props.baseColor,
    iconColor   = state.active   ?
                                props.activeColor : (state.loaded) ?
                                props.overlayColor : props.baseColor;
    console.log('moddal', this.props)
    return (
      <Modal size='small' closeOnEscape closeIcon open={this.props.open} onClose={this.props.handleClose}>
        <Modal.Header>Upload</Modal.Header>
        <Modal.Content image>
          <div className="ui center aligned grid container">
            <div className="row">
              <label
                className={labelClass}
                onDragEnter={this.onDragEnter}
                onDragLeave={this.onDragLeave}
                onDragOver={this.onDragOver}
                onDrop={this.onDrop}
                style={{outlineColor: borderColor}}
              >
                <img id='uploadedImg' src={state.imageSrc} className={state.loaded ? 'loaded' : undefined}/>
                  <Icon name='cloud upload'/>
                <input type="file" accept="image/*" onChange={this.onFileChange} ref="input" />
              </label>
            </div>
            <div className="row">
              <Dropdown fluid placeholder='Select category'
                selection search
                onChange={(e, data) => this.handleSelectCategory(data.value)}
                options={this.state.categories}
              />
              <Dropdown fluid placeholder='Select classify'
                selection search
                onChange={(e, data) => this.handleSelectClassify(data.value)}
                options={this.state.classifies}
              />
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button fluid positive content='Done' onClick={this.handleUpload} loading={this.state.uploading} style={{marginLeft: 0}} />
        </Modal.Actions>
      </Modal>
    )
  }
}

FileUploader.propTypes = propTypes;
FileUploader.defaultProps = defaultProps;

export default props => (<AuthConsumer>
    {({token, isLoading, isAuth}) => {
      return <FileUploader {...props} token={token} isAuth={isAuth} isLoading={isLoading}/>
    }}
  </AuthConsumer>
)

