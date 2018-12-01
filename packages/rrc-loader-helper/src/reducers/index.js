import registerReducer, { registeredReducers } from './register_reducer';
import pageUpdatedReducer from './page_updated_reducer';
import {
  cleanPageReducer,
  cleanStore,
  registerCleanPageReducer,
} from './clean_page_reducer';

export {
  registerReducer,
  registeredReducers,
  pageUpdatedReducer,
  cleanStore,
  cleanPageReducer,
  registerCleanPageReducer,
};
