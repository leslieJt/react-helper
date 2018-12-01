/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

export default connect(state => state['b/a'])(({ loading }) => (
  <div>
  我是b.a.ab.bd!
    <input type="text" data-bind="k" />
    {loading && '正在加载。。。'}
    <button data-load={{
      fn: async () => new Promise(resolve => setTimeout(() => resolve({ k: 100 }), 2000)),
      arg: [],
      loadings: ['loading'],
    }}
    >
    click me!
    </button>
  </div>
));
