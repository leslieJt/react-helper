/**
 * Created by fed on 2017/8/25.
 */
import React from 'react';
import { Link } from 'react-router-dom';

export default ({ children }) => {
  return <div>
    zz导航
    <div>
      <Link to="/a"> a </Link>
    </div>
    <div>
      <Link to="/b"> b </Link>
    </div>
    <div>
      <Link to="/b/a"> ba </Link>
    </div>
    {children || '啧啧啧'}
  </div>;
}
