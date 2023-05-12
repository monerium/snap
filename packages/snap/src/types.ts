import { BearerProfile, Profile, Balances } from '@monerium/sdk';

export type AuthParameters = {
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: 'S256';
};

export type AuthFlowParams = {
  clientId: string;
  redirectUri: string;
};
export type AuthParams = {
  code: string;
};

export type PlaceOrderParams = {
  signature: string;
  message: string;
  amount: string;
  counterpartIban: string;
};

export type State = {
  auth?: {
    code_verifier?: string;
    client_id?: string;
    redirect_uri?: string;
    token?: {
      created_at: string; // TODO: datetime
    } & BearerProfile;
  };
  profile?: Profile;
  balances?: Balances;
  // tokens?: Token[];
  // orders?: Order[];
};
