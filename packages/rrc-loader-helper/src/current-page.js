import createReactContext from '@vve/create-react-context';

let currentPage;
const callbacks = [];

export function get() {
  return currentPage;
}

export function set(c) {
  for (let i = 0; i < callbacks.length; i += 1) {
    callbacks[i](currentPage, c);
  }
  currentPage = c;
}

export function setCallback(fn) {
  callbacks.push(fn);
}

const currentPageContext = createReactContext({
  page: '',
  url: null,
  retain: false,
});
createReactContext.displayName = 'RRC-CurrentPage';

export const CurrentPageContext = currentPageContext;
