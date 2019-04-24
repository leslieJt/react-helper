/**
 * Created by fed on 2017/8/25.
 */
import React from 'react';
import {
  Menu,
} from 'shineout';
import {
  connect,
} from 'react-redux';

import store from './reducer';

class Comp extends React.Component {
  componentDidMount() {
    store.init();
  }
  render() {
    const {
      children, dt,
    } = this.props;
    return (
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <Menu
          keygen="url"
          data={dt}
          renderItem={d => <a href={d.url}>{d.title}</a>}
          style={{ width: 160 }}
          inlineIndent={24}
        />
        {children || '啧啧啧'}
      </div>
    );
  }
}

export default connect(state => state.nav)(Comp);
