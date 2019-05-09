import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import store from './reducer';

class LifeCycle extends React.Component {
  constructor(props) {
    super(props);

    this.addCount = this.addCount.bind(this);
  }

  addCount() {
    const { params, odd } = this.props;
    store.set({ 'params.count': params.count + 1, odd: odd + 2 }).then(() => {
      console.log('updated: ', this.props.params.count);
    });
  }

  render() {
    const { match, params, odd } = this.props;

    return (
      <div>
        <div>lifecycle demo!</div>
        <button type="button" onClick={this.addCount}>add Count</button>
        <div>
      params:
          {JSON.stringify(match.params)}
        </div>
        <div>
        count:
          {params.count}
        </div>
        <div>
          odd:
          {odd}
        </div>
        <br />
        goto:
        <Link to="/lifecycle/123">123</Link>
        <br />
        goto:
        <Link to="/lifecycle/456">456</Link>
      </div>
    );
  }
}

LifeCycle.propTypes = {
  match: PropTypes.shape({}).isRequired,
  params: PropTypes.shape({
    count: PropTypes.number.isRequired,
  }).isRequired,
  odd: PropTypes.number.isRequired,
};

export default LifeCycle;
