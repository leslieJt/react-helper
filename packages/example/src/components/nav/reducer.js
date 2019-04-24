/**
 * Created by fed on 2017/8/25.
 */
export default {
  defaultState: {
    dt: [],
  },
  * init() {
    yield (draft) => {
      draft.dt = [
        {
          url: '#/a',
          title: '小样例',
        },
        {
          url: '#/b/list/0',
          title: '查询列表带Tab',
        },
        {
          url: '#/b/a',
          title: '输入框',
        },
      ];
    };
  },
};
