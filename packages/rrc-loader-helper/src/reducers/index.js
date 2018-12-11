import registerReducer, { decorateReducers } from './register_reducer';
import pageUpdatedReducer from './page_updated_reducer';
import {
  cleanPageReducer,
  cleanStore,
  registerCleanPageReducer,
} from './clean_page_reducer';

export {
  registerReducer,
  pageUpdatedReducer,
  decorateReducers,
  cleanStore,
  cleanPageReducer,
  registerCleanPageReducer,
};
