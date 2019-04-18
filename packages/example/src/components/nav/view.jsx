/**
 * Created by fed on 2017/8/25.
 */
import React from 'react';
import {
  Menu,
} from 'shineout';

export default ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'stretch' }}>
    <Menu
      keygen="url"
      data={[
        {
          url: '#/a',
          title: '小样例',
        },
        {
          url: '#/b/list/0',
          title: '查询列表带Tab',
        },
        {
          url: '#/b/a',
          title: '输入框',
        },
      ]}
      renderItem={d => <a href={d.url}>{d.title}</a>}
      style={{ width: 160 }}
      inlineIndent={24}
    />
    {children || '啧啧啧'}
  </div>
);
