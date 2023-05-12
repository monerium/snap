import { defaultSnapOrigin } from '../config';

export const placeOrderPrompt = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'emi_prompt_place_order' },
    },
  });
};

export const placeOrder = async (
  signature,
  message,
  amount,
  counterpartIban,
) => {
  return await window.ethereum
    .request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: defaultSnapOrigin,
        request: {
          method: 'emi_place_order',
          params: {
            signature,
            message,
            amount,
            counterpartIban,
          },
        },
      },
    })
    .then((res) => {
      console.log('res', res);
      // sadly there is no longer WebSocket support for snaps and maybe never will be.
      // we could do some order endpoint polling here instead.
      return res;
    })
    .catch((e) => console.error('snap.ts', e));
};

export const getRedirectUrl = async () => {
  const url = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'emi_connect',
        params: {
          clientId: 'a08bfa22-e6d6-11ed-891c-2ea11c960b3f',
          redirectUri: 'http://localhost:8000',
        },
      },
    },
  });
  return url;
};

export const authenticate = async (code) => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'emi_auth',
        params: {
          code,
        },
      },
    },
  });
};
