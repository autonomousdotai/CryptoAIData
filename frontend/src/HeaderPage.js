import PropTypes from 'prop-types'
import React, {Component} from 'react'

import {Route, Link,Redirect} from 'react-router-dom'
import {AuthConsumer} from './AuthContext'
import UploadModal from './UploadModal'
import {iosTimer, iosTimerOutline , iosNavigateOutline , iosAnalytics, iosPersonOutline ,iosCameraOutline} from 'react-icons-kit/ionicons'
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
} from 'semantic-ui-react'
 

//lets say the icons on your side navigation are all color red style: {color: '#EF233C'}
const SideIconContainer =  withBaseIcon({ size:32}) 
const SideIconCenterContainer =  withBaseIcon({ size:64, style:{marginTop:'-18px', color:'#54c8ff'}})

class DesktopContainer extends Component {
  state = {
    activeItem: 'home',
    uploadModalOpen: false
  }

  componentDidMount() {
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

  render() {
    const {children} = this.props
    const {fixed} = this.state
    const {activeItem} = this.state
    return (
      <Responsive {...Responsive.onlyComputer}>
        <Segment textAlign='center' vertical style={{"marginBottom": "1em"}}>
          <Menu
            fixed={fixed ? 'top' : null}
            inverted={true}
            size='large'
            style={{marginTop: "-1em", borderRadius: "0"}}
          >
            <Container>
              <Link to="/">
                <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick}>Home</Menu.Item>
              </Link>

                <Search
                    //loading={isLoading}
                    //onResultSelect={this.handleResultSelect}
                    //onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
                    //results={results}
                    //value={value}
                    {...this.props}
                  />
              <Link to='#'>
                <Menu.Item name='upload' active={activeItem === 'upload'}
                         onClick={this.handleItemClick}>Upload</Menu.Item>
              </Link>

              <Link to="/dataset/create">
                <Menu.Item name='create' active={activeItem === 'create'}
                           onClick={this.handleItemClick}>New dataset</Menu.Item>
              </Link>
              
              <Link to="/explore">
                <Menu.Item name='explore' active={activeItem === 'explore'}
                           onClick={this.handleItemClick}>Explore</Menu.Item>
              </Link>
              <Menu.Item position='right'>
                {this.props.isAuth ?
                  <Link to={'/p/' + this.props.userId}>
                    <Button inverted={!fixed} primary={fixed} style={{marginLeft: '0.5em'}}>Profile</Button>
                  </Link>
                  :
                  <Link to="/login">
                    <Button inverted={!fixed} primary={fixed} style={{marginLeft: '0.5em'}}>Login</Button>
                  </Link>}
              </Menu.Item>
            </Container>
          </Menu>
          {this.props.children}
          <UploadModal isAuth={this.props.isAuth} open={this.state.uploadModalOpen} handleClose={this.closeModal}/>
        </Segment>
      </Responsive>
    )
  }
}

DesktopContainer.propTypes = {
  children: PropTypes.node,
}

class TabletContainer extends Component {
  state = {
    activeItem: 'home',
    uploadModalOpen:false
  }

  componentDidMount() {
  }

  hideFixedMenu = () => this.setState({fixed: false})
  showFixedMenu = () => this.setState({fixed: true})
  //handleItemClick = (e, {name}) => this.setState({activeItem: name})

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

  render() {
    const {children} = this.props
    const {fixed} = this.state
    const {activeItem} = this.state
    return (
      <Responsive {...Responsive.onlyTablet}>
        <Segment textAlign='center' vertical style={{"marginBottom": "1em"}}>
          <Menu
            fixed={fixed ? 'top' : null}
            inverted={true}
            size='large'
            style={{marginTop: "-1em", borderRadius: "0"}}
          >
            <Container>

            <Link to="/">
                <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick}>Home</Menu.Item>
              </Link>

                <Search
                    //loading={isLoading}
                    //onResultSelect={this.handleResultSelect}
                    //onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
                    //results={results}
                    //value={value}
                    {...this.props}
                  />
              <Link to='#'>
                <Menu.Item name='upload' active={activeItem === 'upload'}
                         onClick={this.handleItemClick}>Upload</Menu.Item>
              </Link>

              <Link to="/dataset/create">
                <Menu.Item name='create' active={activeItem === 'create'}
                           onClick={this.handleItemClick}>New dataset</Menu.Item>
              </Link>
              
              <Link to="/explore">
                <Menu.Item name='explore' active={activeItem === 'explore'}
                           onClick={this.handleItemClick}>Explore</Menu.Item>
              </Link>

              <Menu.Item position='right'>

                {this.props.isAuth ?
                  <Link to={'/p/' + this.props.userId}>
                    <Button inverted={!fixed} primary={fixed} style={{marginLeft: '0.5em'}}>Profile</Button>
                  </Link>
                  :
                  <Link to="/login">
                    <Button inverted={!fixed} primary={fixed} style={{marginLeft: '0.5em'}}>Login</Button>
                  </Link>}
              </Menu.Item>
            </Container>
          </Menu>
          {this.props.children}
          <UploadModal isAuth={this.props.isAuth} open={this.state.uploadModalOpen} handleClose={this.closeModal}/>
        </Segment>
      </Responsive>
    )
  }
}

TabletContainer.propTypes = {
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
  }

  this.handleItemClick = this.handleItemClick.bind(this);
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
        <Visibility onUpdate={this.handleUpdate} once={false}
        >
          <Sidebar.Pushable style={{minHeight: "100vh"}}>
            <Sidebar as={Menu} animation='uncover' inverted vertical visible={sidebarOpened}>
              <Link to="/">
                <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick}>Home</Menu.Item>
              </Link>
              <Link to="/history">
                <Menu.Item name='history' active={activeItem === 'history'}
                           onClick={this.handleItemClick}>Upload</Menu.Item>
              </Link>

              <Link to="/dataset/create">
                <Menu.Item name='create' active={activeItem === 'create'}
                           onClick={this.handleItemClick}>New dataset</Menu.Item>
              </Link>

              <Link to="/explore">
                <Menu.Item name='explore' active={activeItem === 'explore'}
                           onClick={this.handleItemClick}>Explore</Menu.Item>
              </Link>
            </Sidebar>

            <Sidebar.Pusher dimmed={sidebarOpened} onClick={this.handlePusherClick}>
              <Segment textAlign='center' style={{padding: '1em 0em'}} vertical>
                <Menu inverted pointing style={{marginTop: "-1em", borderRadius: "inherit"}}>
                  <Menu.Item onClick={this.handleToggle}>
                    <Icon name='sidebar'/>
                  </Menu.Item>
                  <Search size="mini"
                    //loading={isLoading}
                    //onResultSelect={this.handleResultSelect}
                    //onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
                    //results={results}
                    //value={value}
                    {...this.props}
                  />
                  <Menu.Item position='right'>
                    {this.props.isAuth ?
                      <Link to="/upload">
                        <Button inverted size="mini">
                            <Icon name='cloud upload'/>
                        </Button>
                      </Link>
                      :
                      <Link to="/login">
                        <Button inverted  size="mini">
                          <Icon name='sign in alternate'/>
                        </Button>
                      </Link>}
                  </Menu.Item>
                </Menu>
                {this.props.children}
                <UploadModal isAuth={this.props.isAuth} open={this.state.uploadModalOpen} handleClose={this.closeModal}/>
              </Segment>
            </Sidebar.Pusher>
          </Sidebar.Pushable>  
            <Menu icon  className="ui fluid five item menu footer" id="footer">  
              <Menu.Item  name='home' active={activeItem === 'home'} onClick={this.handleItemClick} >
              <SideIconContainer icon={iosTimerOutline}/></Menu.Item>
              
              <Menu.Item  name='explore' active={activeItem === 'explore'} onClick={this.handleItemClick} >
              <SideIconContainer icon={iosNavigateOutline}/></Menu.Item>
                
              <Menu.Item  name='upload' active={activeItem === 'upload'} onClick={this.handleItemClick}>
              <SideIconCenterContainer icon={iosCameraOutline}/>
              </Menu.Item>
              
              <Menu.Item  name='history' active={activeItem === 'history'} onClick={this.handleItemClick} >
              <SideIconContainer icon={iosAnalytics}/></Menu.Item>
              
              <Menu.Item  name='profile' active={activeItem === 'profile'} onClick={this.handleItemClick}>
              <SideIconContainer icon={iosPersonOutline}/></Menu.Item>
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
        <TabletContainer {...props} userId={userId} isAuth={isAuth}/>
        <MobileContainer {...props} userId={userId} isAuth={isAuth}/>
      </div>
    }}
  </AuthConsumer>
)
