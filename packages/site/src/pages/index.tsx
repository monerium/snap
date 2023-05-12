import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { placeOrderMessage, Account, Balances } from '@monerium/sdk';
import { ethers } from 'ethers';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { connectSnap, getSnap, shouldDisplayReconnectButton } from '../utils';
import {
  getRedirectUrl,
  authenticate,
  placeOrder,
  placeOrderPrompt,
} from '../utils/monerium';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendButton,
  Card,
} from '../components';
import { getState } from '../utils/snap';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

// const Subtitle = styled.p`
//   font-size: ${({ theme }) => theme.fontSizes.large};
//   font-weight: 500;
//   margin-top: 0;
//   margin-bottom: 0;
//   ${({ theme }) => theme.mediaQueries.small} {
//     font-size: ${({ theme }) => theme.fontSizes.text};
//   }
// `;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [orderPlaced, setOrderPlaced] = useState<any>(false);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  let called = false;

  useEffect(() => {
    if (!called) {
      called = true;

      const connectToWallet = async () => {
        const p = new ethers.BrowserProvider(window.ethereum);
        const s = await p.getSigner();

        setProvider(p);
        setSigner(s);
        console.log('signer', s);
        console.log('provider', p);
      };
      connectToWallet();

      const queryParams = new URLSearchParams(document.location.search);
      const code = queryParams.get('code');

      const getAccess = async (c: string) => {
        const s = await getState();
        if (s.auth.code_verifier) {
          await authenticate(c);
          const st = await getState();
          setProfileName(st?.profile?.name);
          setAccounts(st?.profile?.accounts);
          setBalances(st?.balances);
        }
      };

      if (code) {
        getAccess(code);
      }
    }
  }, []);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      console.log(
        '%c installedSnap',
        'color:white; padding: 30px; background-color: darkgreen',
        installedSnap,
      );

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendHelloClick = async () => {
    try {
      const url = await getRedirectUrl();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const amount = await placeOrderPrompt();
      const counterpartIban = 'GR16 0110 1250 0000 0001 2300 695';
      const message = placeOrderMessage(amount, counterpartIban);
      const signature = await signer
        ?.signMessage(message)
        .catch((e) => console.error(e));

      setOrderPlaced(
        await placeOrder(signature, message, amount, counterpartIban).catch(
          (e) => console.error('index', e),
        ),
      );
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const getAccountsWithBalances = (accs, bal) => {
    return accs
      .filter((account) => account.currency === 'eur' && Boolean(account.iban))
      .map((account) => {
        const balance = bal
          .find(
            (b) =>
              b.address === account.address &&
              b.chain === account.chain &&
              b.network === account.network,
          )
          .balances.find((b) => b.currency === 'eur');
        return (
          <p>
            <p>
              {account.chain}:{account.network} - {account.address}
            </p>
            <p>IBAN: {account.iban}</p>
            <p>{balance?.amount} EUR</p>
          </p>
        );
      });
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>monerium-snap</Span>
      </Heading>

      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Connect to Monerium',
            description:
              'You will be redirected to the Monerium onboarding flow.',
            button: (
              <SendButton
                onClick={handleSendHelloClick}
                disabled={!state.installedSnap}
                title="Connect to Monerium"
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
        {profileName && (
          <>
            <Notice>
              <p>
                Welcome {profileName}, you are now authenticated with Monerium
              </p>
              <p>{getAccountsWithBalances(accounts, balances)}</p>
            </Notice>
            <Card
              content={{
                title: 'Place an order',
                description: '',
                button: (
                  <SendButton
                    onClick={handlePlaceOrder}
                    disabled={!state.installedSnap}
                    title="Place an order"
                  />
                ),
              }}
              disabled={!state.installedSnap}
              fullWidth={true}
            />
          </>
        )}
        {orderPlaced && (
          <Notice>
            <p>Order placed</p>
            <p>{JSON.stringify(orderPlaced)}</p>
          </Notice>
        )}
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
