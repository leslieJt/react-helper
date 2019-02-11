/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import {
  getEmbedPage,
} from 'rrc-loader-helper/lib';

import store from './reducer';

const comp = props => {
  const [Embed, getRes] = getEmbedPage("c");
  return (
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
      <div>
        <div onClick={() => console.log(getRes())}>
          child page
        </div>
        <div>
          <Embed args={{ ab: 1 }} />
        </div>
      </div>
    </div>
  )
};

export default comp;
