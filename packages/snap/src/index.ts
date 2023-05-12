import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { AuthFlowParams, AuthParams, PlaceOrderParams } from './types';
import {
  emi,
  handleAuth,
  handleConnect,
  handlePlaceOrder,
  handlePromptOrder,
} from './monerium';
import { getState } from './state';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
emi().getInstance();

export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'get_state':
      return getState();
    case 'emi_connect':
      return handleConnect(request.params as AuthFlowParams);
    case 'emi_auth':
      return handleAuth(request.params as AuthParams);
    case 'emi_prompt_place_order':
      return handlePromptOrder();
    case 'emi_place_order':
      return handlePlaceOrder(request.params as PlaceOrderParams);

    default:
      throw new Error('Method not found.');
  }
};
