import React from 'react';

import {
  CurrentPageContext,
} from '../index';

export default class WithPageComponent extends React.Component {
  constructor(props) {
    super(props);
    this.ThePageContext = null;
    const originalRender = this.render.bind(this);
    const originalDidMount = this.componentDidMount;

    this.componentDidMount = function newComponentDidMount(...args) {
      this.setState({});
      if (originalDidMount) {
        originalDidMount.call(this, ...args);
      }
    };

    this.render = function newRender(...args) {
      if (!this.ThePageContext) {
        return (
          <CurrentPageContext.Consumer>
            {
              (currentPage) => {
                this.ThePageContext = currentPage;
                return null;
              }
            }

          </CurrentPageContext.Consumer>
        );
      }
      return originalRender(...args);
    };
  }
}
