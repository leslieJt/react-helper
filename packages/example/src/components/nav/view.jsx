/**
 * Created by fed on 2017/8/25.
 */
import React from 'react';
import {
  Menu,
} from 'shineout';

export default ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Menu
      keygen="url"
      data={[
        {
          url: '#/a',
          title: 'Navigation One',
        },
        {
          url: '#/b',
          title: 'Navigation Two',
        },
        {
          url: '#/b/a',
          title: 'Navigation Two',
        },
      ]}
      renderItem={d => <a href={d.url}>{d.title}</a>}
      style={{ width: 160 }}
      inlineIndent={24}
    />
    {children || '啧啧啧'}
  </div>
);
