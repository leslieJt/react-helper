import React from 'react';
import { mount } from 'enzyme';
import DeactivatableWrapper from '../deactivatable-wrapper';


describe('component DeactivableWrapper', () => {
  it('should call render when active & should not call render when deactive', () => {
    const renderCounter = jest.fn();
    const ChildComponent = () => {
      renderCounter();
      return (
        <div>
          hello, I am child!
        </div>
      );
    };
    class App extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          childActive: true,
        };
      }

      render() {
        return (
          <DeactivatableWrapper active={this.state.childActive}>
            <ChildComponent />
          </DeactivatableWrapper>
        );
      }
    }

    const app = mount(<App />);

    expect(renderCounter.mock.calls.length).toBe(1);
    app.setState({
      childActive: false,
    });
    expect(renderCounter.mock.calls.length).toBe(1);
    app.update();
    expect(renderCounter.mock.calls.length).toBe(1);
  });
});
