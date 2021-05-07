
export default {

  namespace: 'redis',

  state: {
    hostInstance:[],
    instance:[]
  },

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'save' });
    },
  },

  reducers: {
    saveHost(state, action) {
      console.log(action.payload);
      return { ...state, hostInstance:[...state.hostInstance,action.payload ]};
    },
    save(state, action) {
      return { ...state, instance:[...state.instance,action.payload ]};
    },
    init(state, action) {
      return { ...state, instance:[ ],
      hostInstance: []};
    },
  },

};
