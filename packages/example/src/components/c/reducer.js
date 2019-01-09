/**
 * Created by fed on 2017/8/24.
 */
const defaultState = {
  zzzz: 90
};

export default {
  defaultState,
  $out(state) {
    console.log(state);
    return 1;
  }
}
