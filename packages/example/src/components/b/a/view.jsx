/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import { Button, Input } from 'shineout';

export default class extends React.Component {
  componentDidMount() {
    console.log('page a mounted!');
  }

  render() {
    const { loading } = this.props;
    return (
      <div>
        我是b.a.ab.bd!
        <Input type="text" data-bind="k" />
        {loading && '正在加载。。。'}
        <Button data-load={{
          fn: async () => new Promise(resolve => setTimeout(() => resolve({ k: 100 }), 2000)),
          arg: [],
          loadings: ['loading'],
        }}
        >
          click me!
        </Button>
      </div>
    )
  }

}
