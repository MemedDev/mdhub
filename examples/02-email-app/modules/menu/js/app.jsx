var Icon = semanticUIReact.Icon;
var Input = semanticUIReact.Input;
var Header = semanticUIReact.Header;
var Label = semanticUIReact.Label;
var Menu = semanticUIReact.Menu;

class HMail extends React.Component {
  render() {
    return (
      <React.Fragment>
        <HMailHeader />
        <HMailMenu />
      </React.Fragment>
    );
  }
}

class HMailHeader extends React.Component {
  render() {
    return (
      <Header as='h2' icon inverted textAlign='center'>
        <Icon name='envelope' />
        HMail
        <Header.Subheader>This menu is a module, made using React + Semantic UI</Header.Subheader>
      </Header>
    );
  }
}

class HMailMenu extends React.Component {
  state = { activeItem: 'inbox' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name }, () => {
    MdHub.event.trigger('labelSelected', this.state.activeItem);
  })

  render() {
    const { activeItem } = this.state

    return (
      <Menu inverted vertical>
        <Menu.Item name='inbox' active={activeItem === 'inbox'} onClick={this.handleItemClick}>
          <Label>6</Label>
          Inbox
        </Menu.Item>

        <Menu.Item name='spam' active={activeItem === 'spam'} onClick={this.handleItemClick}>
          <Label>1</Label>
          Spam
        </Menu.Item>

        <Menu.Item name='updates' active={activeItem === 'updates'} onClick={this.handleItemClick}>
          <Label>1</Label>
          Updates
        </Menu.Item>
      </Menu>
    )
  }
}

ReactDOM.render(<HMail />, document.getElementById('app'));