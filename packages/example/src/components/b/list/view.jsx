/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import { connect } from 'react-redux';

import store from './reducer';

const mapStateToProps = state => state['b/list'];
const comp = props => (
  <div>
我是
    {props.name}
啊!
    <div>
      <input type="text" data-bind="name" />
      <button onClick={() => store.zz({})}>
      Hello, 你在做什么
      </button>
      {
      props.loading ? '加载中' : '已完成'
    }
    </div>
  </div>
);

export default connect(mapStateToProps)(comp);
