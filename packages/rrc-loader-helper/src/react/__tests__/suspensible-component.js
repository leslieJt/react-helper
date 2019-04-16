import React from 'react';
import { mount } from 'enzyme';
import SuspensibleComponent from '../suspensible-component';

function genData() {
  let result = null;
  const promiseData = new Promise((resolve) => {
    setTimeout(() => resolve(String(Math.random())), 1000);
  }).then((res) => {
    result = res;
  });

  function getData() {
    if (result) return result;
    throw promiseData;
  }

  return { promiseData, getData };
}

describe('component SuspensibleComponent', () => {
  it('should not call componentDidMount, and render placeholder result if containing promise throwing ', () => {
    const didMount = jest.fn();
    const { getData } = genData();

    class Sus extends SuspensibleComponent {
      componentDidMount() {
        didMount();
      }

      render() {
        return (
          <div>
            {getData()}
          </div>
        );
      }
    }
    Sus.placeholder = <div>123</div>;

    const sus = mount(<Sus />);
    expect(sus.text()).toEqual('123');
    expect(didMount.mock.calls.length).toBe(0);
  });

  it('should call componentDidMount when data resolved', async () => {
    const didMount = jest.fn();
    const { getData, promiseData } = genData();

    class Sus extends SuspensibleComponent {
      componentDidMount() {
        didMount();
      }

      render() {
        return (
          <div>
            {getData()}
          </div>
        );
      }
    }
    Sus.placeholder = <div>123</div>;
    const sus = mount(<Sus />);

    await promiseData;
    expect(sus.text()).toEqual(getData());
    expect(didMount.mock.calls.length).toBe(1);
  });

  it('should not call componentDidMount twice and should render right result', async () => {
    const didMount = jest.fn();
    const { getData, promiseData } = genData();

    class Sus extends SuspensibleComponent {
      constructor(props) {
        super(props);
        this.state = {
          z: false,
        };
      }

      componentDidMount() {
        didMount();
      }

      render() {
        return (
          <div
            className="a"
            onClick={() => this.setState({ z: true })}
          >
            {this.state.z ? getData() : 'ok'}
          </div>
        );
      }
    }
    Sus.placeholder = <div>123</div>;
    const sus = mount(<Sus />);

    expect(sus.text()).toEqual('ok');
    expect(didMount.mock.calls.length).toBe(1);
    sus.find('.a').simulate('click');
    expect(sus.text()).toEqual('123');
    await promiseData;
    expect(sus.text()).toEqual(getData());
    expect(didMount.mock.calls.length).toBe(1);
  });
});
