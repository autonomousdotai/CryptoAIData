import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {AuthConsumer} from './AuthContext'


import {
  Button,
  Container,
  Icon,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
} from 'semantic-ui-react'


class DesktopContainer extends Component {
  state = { activeItem: 'home' }

  componentDidMount() {
    console.log(this.context)
  }

  hideFixedMenu = () => this.setState({fixed: false})
  showFixedMenu = () => this.setState({fixed: true})
  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const {children} = this.props
    const {fixed} = this.state
    const { activeItem } = this.state
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
                  <Menu.Item  name='home' active={activeItem === 'home'} onClick={this.handleItemClick}  >Home</Menu.Item>
                </Link>
                <Link to="/history">
                  <Menu.Item name='history' active={activeItem === 'history'} onClick={this.handleItemClick} >History</Menu.Item>
                </Link>
                <Link to="/category">
                  <Menu.Item name='category' active={activeItem === 'category'} onClick={this.handleItemClick} >Category</Menu.Item>
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
          </Segment>
      </Responsive>
    )
  }
}

DesktopContainer.propTypes = {
  children: PropTypes.node,
}

class MobileContainer extends Component {
  state = { activeItem: 'home' }

  handlePusherClick = () => {
    const {sidebarOpened} = this.state
    if (sidebarOpened) this.setState({sidebarOpened: false})
  }

  handleToggle = () => this.setState({sidebarOpened: !this.state.sidebarOpened})

  render() {
    const {children} = this.props
    const {sidebarOpened} = this.state
    const { activeItem } = this.state

    return (
      <Responsive {...Responsive.onlyMobile}>
        <Sidebar.Pushable>
          <Sidebar as={Menu} animation='uncover' inverted vertical visible={sidebarOpened}>
              <Link to="/">
                <Menu.Item  name='home' active={activeItem === 'home'} onClick={this.handleItemClick}  >Home</Menu.Item>
              </Link>
              <Link to="/history">
                <Menu.Item name='history' active={activeItem === 'history'} onClick={this.handleItemClick} >History</Menu.Item>
              </Link>
              <Link to="/category">
                <Menu.Item name='category' active={activeItem === 'category'} onClick={this.handleItemClick} >Category</Menu.Item>
              </Link>  
          </Sidebar>

          <Sidebar.Pusher dimmed={sidebarOpened} onClick={this.handlePusherClick} >
            <Segment textAlign='center' style={{padding: '1em 0em'}} vertical>
                <Menu inverted pointing style={{marginTop: "-1em", borderRadius: "inherit"}}>
                  <Menu.Item onClick={this.handleToggle}>
                    <Icon name='sidebar'/>
                  </Menu.Item>
                  <Menu.Item position='right'>
                    {this.props.isAuth ?
                    <Link to="/profile">
                      <Button inverted style={{marginLeft: '0.5em'}}>Profile</Button>
                    </Link>
                    :
                    <Link to="/login">
                      <Button inverted style={{marginLeft: '0.5em'}}>Login</Button>
                    </Link>}
                  </Menu.Item>
                </Menu>
              {this.props.children}
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
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
        <MobileContainer {...props} userId={userId} isAuth={isAuth}/>
      </div>
    }}
  </AuthConsumer>
)
