import { panel, text } from '@metamask/snaps-ui';
import {
  Balances,
  MoneriumClient,
  MoneriumPaymentStandard,
  PaymentStandard,
} from '@monerium/sdk';
import { ethers } from 'ethers';
import { AuthFlowParams, AuthParams, PlaceOrderParams } from './types';
import { getState, updateState } from './state';

export const emi = () => {
  let instance = null;

  return {
    getInstance: () => {
      if (instance === null) {
        instance = new MoneriumClient();
        // Hide the constructor so the returned object can't be new'd...
        instance.constructor = null;
      }
      return instance;
    },
  };
};

export const handleConnect = async (params: AuthFlowParams) => {
  const client = emi().getInstance();
  const { clientId, redirectUri } = params;
  const getAuthFlowURI = client.getAuthFlowURI({
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  // TODO: codeVerifier is secret, don't share un-encrypted.
  await updateState({
    auth: {
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: client.codeVerifier,
    },
  });

  return getAuthFlowURI;
};

export const handlePromptOrder = () => {
  return snap.request({
    method: 'snap_dialog',
    params: {
      type: 'prompt',
      content: panel([
        text('Placing an Order'),
        text('Please enter the amount in EUR to transfer.'),
      ]),
      placeholder: '1',
    },
  });
};

export const handleAuth = async (params: AuthParams) => {
  const client = emi().getInstance();
  const { code } = params;
  const state = await getState();

  const auth = await client.auth({
    client_id: (state.auth as Record<string, string>)?.client_id,
    redirect_uri: (state.auth as Record<string, string>)?.redirect_uri,
    code_verifier: (state.auth as Record<string, string>)?.code_verifier,
    code,
  });

  const authContext = await client.getAuthContext();
  const profile = await client.getProfile(authContext?.defaultProfile);
  const balances = await client.getBalances(authContext?.defaultProfile);

  await updateState({
    auth: {
      ...(state.auth as Record<string, string>),
      token: {
        created_at: new Date().toISOString(),
        ...auth,
      },
    },
    profile,
    balances: balances as Balances,
  });
};

export const handlePlaceOrder = async (
  params: PlaceOrderParams,
): Promise<any> => {
  const client = emi().getInstance();
  const state = await getState();
  const { signature, message, amount, counterpartIban } = params;

  if (!client.bearerProfile?.access_token) {
    console.log(
      '%c state.auth',
      'color:white; padding: 30px; background-color: darkgreen',
      state.auth,
    );

    console.log(
      '%c state.auth.token',
      'color:white; padding: 30px; background-color: darkgreen',
      state.auth.token,
    );

    const auth = await client.auth({
      client_id: state.auth.client_id,
      refresh_token: state.auth.token.refresh_token,
    });

    await updateState({
      auth: {
        ...(state.auth as Record<string, string>),
        token: {
          created_at: new Date().toISOString(),
          ...auth,
        },
      },
    });
  }

  const res = await client
    .placeOrder({
      amount,
      signature,
      message,
      counterpart: {
        identifier: {
          standard: PaymentStandard.iban,
          iban: counterpartIban,
        },
        details: {
          firstName: 'Test',
          lastName: 'Testson',
        },
      },
      accountId: '3cfc44fe-ee7b-11ed-96f1-da049a006e2a',
    })
    .then(async (r) => {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x13881',
            chainName: 'Matic(Polygon) Mumbai Testnet',
            nativeCurrency: { name: 'tMATIC', symbol: 'tMATIC', decimals: 18 },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
          },
        ],
      });

      // const filter = await ethereum.request<string>({
      //   method: 'eth_newFilter',
      //   params: [
      //     {
      //       fromBlock: 'latest',
      //       toBlock: 'pending',
      //       address: ['0xE0292841fDb2e80a9d0F1d6Db1Bc354d8E888B82'],
      //       topics: [],
      //     },
      //   ],
      // });
      // ethereum.on('pending', (tx) => {
      //   console.log(
      //     '%c tx',
      //     'color:white; padding: 30px; background-color: darkgreen',
      //     tx,
      //   );
      // });

      return r;
    })
    .catch((err) => console.error('client placeorder', err));

  console.log('placeOrder res', res);

  return res;
};
