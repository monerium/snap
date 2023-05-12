import { State } from './types';

export const updateState = async (newState: State) => {
  return await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState },
  });
};

export const getState = async () => {
  return await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
};
