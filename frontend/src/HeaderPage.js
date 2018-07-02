import PropTypes from 'prop-types'
import React, {Component} from 'react'
import _ from 'lodash'

import {Route, Link,Redirect} from 'react-router-dom'
import {AuthConsumer} from './AuthContext'
import UploadModal from './UploadModal'
import agent from './agent'
import {iosTimer, iosTimerOutline,iosCloudUploadOutline,iosPlusOutline, iosNavigateOutline , iosAnalytics, iosPersonOutline ,iosCameraOutline} from 'react-icons-kit/ionicons'
import { withBaseIcon } from 'react-icons-kit'
import {
  Form,
  Button,
  Container,
  Icon,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
  Search,
  Header,
  Image,
} from 'semantic-ui-react'


//lets say the icons on your side navigation are all color red style: {color: '#EF233C'}
const SideIconContainer =  withBaseIcon({ size:32})
const SideIconTopContainer =  withBaseIcon({ size:32, color:'#333'})

const SideIconCenterContainer =  withBaseIcon({ size:64, style:{marginTop:'-18px', color:'#54c8ff'}})

class DesktopContainer extends Component {
  state = {
    isLoading: false,
    results:[],
    value:'',
  }

  componentDidMount() {
    console.log(this.props);
  }

  hideFixedMenu = () => this.setState({fixed: false})
  showFixedMenu = () => this.setState({fixed: true})
  handleItemClick = (e, {name}) => {
    if (name === 'upload') {
      this.setState({activeItem: name, uploadModalOpen: true})
    } else {
      this.setState({activeItem: name})
    }
  }

  closeModal = () => {
    this.setState({uploadModalOpen: false})
  }

  handleResultSelect = (e, { result }) => {
    this.setState({ value: result.title })
    window.location.href = '/cat/' + result.id
  }

  handleSearchDebounced = _.debounce((value) => {
    if (!value) {
      this.setState({results: [], isLoading: false});
      return
    }

    agent.req.get(agent.API_ROOT + '/api/search/?q=' + value).then((response) => {
      const results = [];
      response.body.results.forEach(function(r) {
        results.push({
          title: r.name,
          id: r.id
        })
      })
      this.setState({
        isLoading: false,
        results
      })
    })
  }, 300)

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })
    this.handleSearchDebounced(value);
  }

  render() {
    const {children} = this.props
    const {fixed} = this.state
    const {activeItem} = this.state
    return (
      <Responsive  minWidth={768}>
        <Segment textAlign='center' vertical style={{"marginBottom": "1em"}}>
          <Container  style={{"marginBottom": "4.5em"}}>
            <Menu fixed='top'  inverted={true}  size='large'
            style={{marginTop: "0em", borderRadius: "0", padding:'0em 1em 0.8em'}}  id="topbarMenu"
            >
                <Link to="/" >
                  <Menu.Item position='left' name='home' active={activeItem === 'home'} onClick={this.handleItemClick}>
                    <Image src="/images/logo2.png"  avatar style={{width:'35px', height:'35px'}} />
                  </Menu.Item>
                </Link>
                  <Menu.Item position='right'/>

                  <Search fluid
                        loading={this.state.isLoading}
                        onResultSelect={this.handleResultSelect}
                        onSearchChange={this.handleSearchChange}
                        results={this.state.results}
                        value={this.state.value}
                        {...this.props}
                      />

                  <Link to="/explore" >
                  <Menu.Item position='right' name='explore' active={activeItem === 'explore'}  onClick={this.handleItemClick}>
                              <SideIconTopContainer icon={iosNavigateOutline}/>
                  </Menu.Item>
                  </Link>
                  <Link to='#'  className="right">
                    <Menu.Item position='right' name='upload' active={activeItem === 'upload'}
                            onClick={this.handleItemClick}>
                            <SideIconTopContainer icon={iosCloudUploadOutline}/></Menu.Item>
                  </Link>

                  <Link to="/dataset/create"  className="right">
                    <Menu.Item position='right' name='create' active={activeItem === 'create'}
                              onClick={this.handleItemClick}>
                                <SideIconTopContainer icon={iosPlusOutline}/>
                              </Menu.Item>
                  </Link>
                  <Link to="/history"  className="right">
                    <Menu.Item position='right' name='history' active={activeItem === 'history'} onClick={this.handleItemClick} >
                        <SideIconTopContainer icon={iosAnalytics}/>
                    </Menu.Item>
                  </Link>

                  {this.props.isAuth ?

                    <Link to={'/p/' + this.props.userId}  className="right">
                      <Menu.Item position='right'  name={'/p/' + this.props.userId} active={activeItem ==='/p/' + this.props.userId } onClick={this.handleItemClick} >
                        <SideIconTopContainer icon={iosPersonOutline}/>
                      </Menu.Item>
                    </Link>
                    :
                    <Link to="/login">
                      <Menu.Item position='right'>
                          <Button color='blue' basic inverted={!fixed}  style={{marginLeft: '0.5em'}}>
                          Login
                          </Button>
                      </Menu.Item>
                    </Link>}
            </Menu>
          </Container>
          {this.props.children}
          <UploadModal isAuth={this.props.isAuth} open={this.state.uploadModalOpen} handleClose={this.closeModal}/>
        </Segment>
      </Responsive >
    )
  }
}

DesktopContainer.propTypes = {
  children: PropTypes.node,
}

class MobileContainer extends Component {

  constructor(props) {
    super(props)

    this.state = {
      activeItem: 'home',
      calculations: {
        direction: 'none',
      },
      go_url:"",
      uploadModalOpen:false,
      isLoading: false,
      results:[],
      value:'',
    }

    this.handleItemClick = this.handleItemClick.bind(this);
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleResultSelect = (e, { result }) => {
    this.setState({ value: result.title })
    window.location.href = '/cat/' + result.id
  }

  handleSearchDebounced = _.debounce((value) => {
    if (!value) {
      this.setState({results: [], isLoading: false});
      return
    }

    agent.req.get(agent.API_ROOT + '/api/search/?q=' + value).then((response) => {
      const results = [];
      response.body.results.forEach(function(r) {
        results.push({
          title: r.name,
          id: r.id
        })
      })
      this.setState({
        isLoading: false,
        results
      })
    })
  }, 300)

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })
    this.handleSearchDebounced(value);
  }

  closeModal = () => {
    this.setState({uploadModalOpen: false})
  }

  handlePusherClick = () => {
    const {sidebarOpened} = this.state
    if (sidebarOpened) this.setState({sidebarOpened: false})
  }

  handleUpdate = (e, {calculations}) => {
    this.setState({calculations});
    // console.log(calculations.direction);
  }

  handleItemClick(e, { name, value }) {

    if (name =="home" && this.state.go_url !="/"){
      this.setState({activeItem: name, go_url: "/"});
      return;
    }
    if (name === 'upload') {
      this.setState({activeItem: name, uploadModalOpen: true})
      return;
    }
    if(name=="profile"){
      this.setState({activeItem: name, go_url:  '/p/' + this.props.userId});  //{'/p/' + this.props.userId}
      return;
    }
    else{
      this.setState({activeItem: name, go_url: "/"+name});
    }

  }
  componentDidMount() {
    console.log(this.props);
  }
  //handleItemClick = (e, {name}) => this.setState({activeItem: name})

  handleToggle = () => this.setState({sidebarOpened: !this.state.sidebarOpened})

  render() {
    const {children} = this.props
    const {sidebarOpened} = this.state
    const {activeItem} = this.state

    return (
      <Responsive {...Responsive.onlyMobile}>
        { this.state.go_url !="/upload" ? <Redirect to={this.state.go_url} /> :"" }
        <Visibility onUpdate={this.handleUpdate} once={false}  >
            <Menu  icon  className="ui fluid five item menu fixed" id="head-searchbox">

               <Search
                       fluid
                        loading={this.state.isLoading}
                        onResultSelect={this.handleResultSelect}
                        onSearchChange={this.handleSearchChange}
                        results={this.state.results}
                        value={this.state.value}
                        {...this.props}
                      />
            </Menu>

            <Segment textAlign='center' style={{marginTop:'7.5em', padding: '1em 0em',bottom:'4em'}} vertical>
              {this.props.children}
              <UploadModal isAuth={this.props.isAuth} open={this.state.uploadModalOpen} handleClose={this.closeModal}/>
            </Segment>

            <Menu icon  className="ui fluid five item menu footer" id="footer">
              <Menu.Item  name='home' active={activeItem === 'home'} onClick={this.handleItemClick} >
                  {activeItem === 'home' ? <img class="my-menu-bar" src="/icons/homeactive.svg"/>: <img class="my-menu-bar" src="/icons/home.svg"/> }
                </Menu.Item>

              <Menu.Item  name='explore' active={activeItem === 'explore'} onClick={this.handleItemClick} >
                {activeItem === 'explore' ? <img class="my-menu-bar" src="/icons/compassactive.svg"/>: <img class="my-menu-bar" src="/icons/Compass.svg"/> }

              </Menu.Item>

              <Menu.Item  name='upload' active={activeItem === 'upload'} onClick={this.handleItemClick}>
                 <img class="my-menu-bar-center" src="/icons/qa.png"/>
              </Menu.Item>

              <Menu.Item  name='history' active={activeItem === 'history'} onClick={this.handleItemClick} >
                 {activeItem === 'history' ? <img class="my-menu-bar" src="/icons/activityactive.svg"/>: <img class="my-menu-bar" src="/icons/activity.svg"/> }
              </Menu.Item>

              <Menu.Item  name='profile' active={activeItem === 'profile'} onClick={this.handleItemClick}>
                <img class="my-menu-bar" src="/icons/user.svg"/>
              </Menu.Item>
            </Menu>
        </Visibility>
      </Responsive>
    )
  }
}

MobileContainer.propTypes = {
  children: PropTypes.node,
}

export default props => (<AuthConsumer>
    {({isAuth, userId}) => {
      return <div>
        <DesktopContainer {...props} userId={userId} isAuth={isAuth}/>
        {/* <TabletContainer {...props} userId={userId} isAuth={isAuth}/> */}
        <MobileContainer {...props} userId={userId} isAuth={isAuth}/>
      </div>
    }}
  </AuthConsumer>
)
