/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import {
  Button, Input,
} from 'shineout';

import store from './reducer';
import './style.css';

class Compo extends React.Component {
  render() {
    const props = this.props;
    // const [Embed, getRes] = getEmbedPage('c');
    return (
      <div>
        <div className="tabs">
          <a href="#/b/list/1">tab1</a>
          <a href="#/b/list/2">tab2</a>
          <a href="#/b/list/3">tab3</a>
        </div>
        我是
        {' '}
        {props.name}
        {' '}
        {props.match.url}
        啊!
        <div style={{ display: 'flex' }}>
          <div>
            <Input type="text" data-bind="name" />
          </div>
          <Button type="primary" onClick={() => store.zz({}).then(() => console.log('zzz done'))}>
            Hello, 你在做什么
          </Button>
          {
            props.loading ? '加载中' : '已完成'
          }
        </div>
        <div>
          <div>
            {/* <Embed args={{ ab: 1 }} /> */}
          </div>
        </div>
      </div>
    );
  }
}

export default Compo;
