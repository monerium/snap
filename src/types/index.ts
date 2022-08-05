// Endpoint params

export interface AuthParameters {
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: 'S256';
}

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  profile: string;
  refresh_token: string;
  token_type: 'Bearer';
  userId: string;
}

// RPC Props

export interface ConnectProps {
  clientId: string;
  redirectUri: string;
}

export interface CustomerAuthProps {
  code: string;
}

// Common

export type UniqueId = string; // uuid
export type IBAN = string;
export type Chain = 'polygon' | 'ethereum';
export type Network = 'local' | 'mumbai' | 'goerli' | 'mainnet';
export type Address = string; // get from ethers?
export type Signature = string; // get from ethers?
export type CurrencyCode = 'eur' | 'gbp' | 'usd' | 'isk';
export type TokenCode = 'EURe' | 'GBPe' | 'USDe' | 'ISKe';
export type KYCStatus = 'absent' | 'submitted' | 'pending' | 'confirmed';
export type KYCOutcome = 'approved' | 'rejected' | 'none' | 'unknown';
export type TreasuryStandard = 'iban' | 'sort';

export interface Token {
  currency: CurrencyCode;
  ticker: Uppercase<CurrencyCode>;
  symbol: TokenCode;
  chain: Chain;
  network: Network;
  address: Address;
  decimals: number;
}

export interface Balance {
  currency: CurrencyCode;
  amount: string;
}

export interface Balances {
  id: UniqueId;
  chain: Chain;
  network: Network;
  address: Address;
  balances: Balance[];
}

export interface State {
  address: Address;
  balances: Balances;
}

export interface Account {
  id: UniqueId;
  standard?: TreasuryStandard;
  iban?: IBAN;
  address: Address;
  currency: CurrencyCode;
  network: Network;
  chain: Chain;
}

export interface Profile {
  id: UniqueId;
  name: string;
  kyc: {
    state: KYCStatus;
    outcome: KYCOutcome;
  };
  defaultProfile: UniqueId;
  accounts: Account[];
}

export interface AuthProfile {
  id: UniqueId;
  kind: string;
  name: string;
  perms: Array<'read' | 'write'>;
}

export interface AuthContext {
  userId: UniqueId;
  email: string;
  name: string;
  roles: [];
  auth: {
    method: 'password'; // soon: | 'signature'
    subject: string;
    verified: boolean;
  };
  defaultProfile: UniqueId;
  profiles: AuthProfile[];
}

export enum Events {
  Tokens = 'tokens',
  Address = 'address',
  Profile = 'profile',
  Balances = 'balances',
  AuthContext = 'authContext',
}
export interface WalletSignature {
  message: string;
  address: Address;
  signature: Signature;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string; // "Bearer",
  expires_in: number;
  refresh_token: string;
  scope: string; // "orders:read",
  profile: string; //uuid,
  userId: string; //uuid
}

export type Domain = 'treasury' | 'emoney';

export interface Fee {
  provider: string;
  source: string;
  currency: string;
  amount: string;
  meta?: {
    domain: Domain;
  };
}
export type OrderKind = 'issue' | 'redeem' | 'send' | 'receive';
export type OrderState = 'placed' | 'pending' | 'processed' | 'rejected';

export interface Counterpart {
  identifier: IbanIdentifier | ScanIdentifier;
  details: {
    name?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    country?: string;
  };
}

// Treasury identifier
export type Standard = 'iban' | 'scan';

export interface Identifier {
  standard: Standard;
  bic?: string;
}

export interface IbanIdentifier extends Identifier {
  iban: string;
}
export interface ScanIdentifier extends Identifier {
  sortCode: string; // 6-digits
  accountNumber: string; // 8-digits
}
// Order
export interface Order {
  id: UniqueId;
  profile: UniqueId;
  kind: OrderKind;
  address: string;
  amount: string;
  currency: CurrencyCode;
  batchId?: string;
  accountId: UniqueId;
  treasuryAccountId?: UniqueId;
  counterpart?: Counterpart;
  txHash?: string;
  memo?: string;
  message?: string;
  rejectedReason?: string;
  signature?: Signature;
  fees?: Fee[];
  totalFee: string;
  supportingDocumentId?: string;
  meta: {
    state: OrderState;
    placedBy: string;
    placedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    confirmedAt?: string;
    receivedAmount?: string;
    sentAmount?: string;
  };
}

export interface Monerium {
  getTokens: () => Promise<Token[]>;
  getProfile: (profileId: UniqueId) => Promise<Profile>;
  getBalances: () => Promise<Balances>;
  getAuthContext: () => Promise<AuthContext>;
}
