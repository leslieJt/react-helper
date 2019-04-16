import createReactContext from 'create-react-context';

const routerContext = createReactContext(null);
routerContext.displayName = 'RRC-Router';

export default routerContext;
