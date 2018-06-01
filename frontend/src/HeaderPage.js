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
  state = {}

  componentDidMount() {
  }

  hideFixedMenu = () => this.setState({fixed: false})
  showFixedMenu = () => this.setState({fixed: true})

  render() {
    const {children} = this.props
    const {fixed} = this.state

    return (
      <Responsive {...Responsive.onlyComputer}>
        <Visibility once={false} onBottomPassed={this.showFixedMenu} onBottomPassedReverse={this.hideFixedMenu}>
          <Segment inverted textAlign='center' vertical>
            <Menu
              fixed={fixed ? 'top' : null}
              inverted={!fixed}
              pointing={!fixed}
              secondary={!fixed}
              size='large'
            >
              <Container>
                <Link to="/">
                  <Menu.Item active>Home</Menu.Item>
                </Link>
                <Link to="/history">
                  <Menu.Item>History</Menu.Item>
                </Link>
                <Link to="/category">
                  <Menu.Item>Category</Menu.Item>
                </Link>
                <Menu.Item position='right'>
                  {this.props.isAuth ?
                    <Link to="/profile">
                      <Button inverted={!fixed} primary={fixed} style={{marginLeft: '0.5em'}}>Hello</Button>
                    </Link>
                    :
                    <Link to="/login">
                      <Button inverted={!fixed} primary={fixed} style={{marginLeft: '0.5em'}}>Login</Button>
                    </Link>}
                </Menu.Item>
              </Container>
            </Menu>
            {children}
          </Segment>
        </Visibility>
      </Responsive>
    )
  }
}

DesktopContainer.propTypes = {
  children: PropTypes.node,
}

class MobileContainer extends Component {
  state = {}

  handlePusherClick = () => {
    const {sidebarOpened} = this.state
    if (sidebarOpened) this.setState({sidebarOpened: false})
  }

  handleToggle = () => this.setState({sidebarOpened: !this.state.sidebarOpened})

  render() {
    const {children} = this.props
    const {sidebarOpened} = this.state

    return (
      <Responsive {...Responsive.onlyMobile}>
        <Sidebar.Pushable>
          <Sidebar as={Menu} animation='uncover' inverted vertical visible={sidebarOpened}>
            <Link to="/">
              <Menu.Item active>Home</Menu.Item>
            </Link>
            <Link to="/history">
              <Menu.Item active>History</Menu.Item>
            </Link>
            <Link to="/category">
              <Menu.Item>Category</Menu.Item>
            </Link>
          </Sidebar>

          <Sidebar.Pusher dimmed={sidebarOpened} onClick={this.handlePusherClick} style={{minHeight: '100vh'}}>
            <Segment inverted textAlign='center' style={{minHeight: 350, padding: '1em 0em'}} vertical>
              <Container>
                <Menu inverted pointing secondary size='large'>
                  <Menu.Item onClick={this.handleToggle}>
                    <Icon name='sidebar'/>
                  </Menu.Item>
                  <Menu.Item position='right'>
                    {this.props.isAuth ?
                    <Link to="/profile">
                      <Button inverted style={{marginLeft: '0.5em'}}>Hello</Button>
                    </Link>
                    :
                    <Link to="/login">
                      <Button inverted style={{marginLeft: '0.5em'}}>Login</Button>
                    </Link>}
                  </Menu.Item>
                </Menu>
              </Container>
              {children}
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
    {({isAuth}) => {
      return <div>
        <DesktopContainer {...props} isAuth={isAuth}/>
        <MobileContainer {...props} isAuth={isAuth}/>
      </div>
    }}
  </AuthConsumer>
)
