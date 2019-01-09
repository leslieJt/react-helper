/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import { Link } from 'react-router-dom';

export default ({ storyArg, outBound }) => {
  return (
    <div>
      <div>我是a 啊!</div>
      <Link to="/b">2b2b2b2</Link>
      <input type="text" data-bind="abc" />
    </div>
  );
}
