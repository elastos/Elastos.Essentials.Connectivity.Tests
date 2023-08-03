import QRCodeModal from "@walletconnect/qrcode-modal";
import SignClient from "@walletconnect/sign-client";
import { SessionTypes } from "@walletconnect/types";
import UniversalProvider from "@walletconnect/universal-provider";

const projectId = "633b2e6e43eba2cfc7d2910fb364fb10"; // Not needed if using our custom relay server
const relayUrl = "wss://walletconnect.elastos.net/v3";
const requiredNamespaces = {
  eip155: {
    methods: [
      "eth_sendTransaction",
      "eth_signTransaction",
      "eth_sign",
      "personal_sign",
      "eth_signTypedData",
      "wallet_switchEthereumChain",
      "wallet_addEthereumChain",
    ],
    chains: ["eip155:56"],
    events: ["chainChanged", "accountsChanged"],
    /* rpcMap: {
      "eip155:56": `https://rpc.walletconnect.com?chainId=eip155:56&projectId=${projectId}`
    } */
  },
};

const walletMetadata = {
  name: "Essentials Test Dapp",
  description: "Essentials Client Test Dapp",
  url: "https://trinity-tech.io",
  icons: ["https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg"],
};

export class WalletConnectV2 {
  private signClient: SignClient;
  private session: SessionTypes.Struct;

  public async setup() {
    console.log("WalletConnectV2 setup");

    this.signClient = await SignClient.init({
      logger: "debug",
      projectId,
      relayUrl,
      metadata: walletMetadata,
    });

    this.listen();
    this.session = await this.connect();
  }

  private listen() {
    console.log("WalletConnectV2 registering events");

    this.signClient.on("session_event", (event) => {
      // Handle session events, such as "chainChanged", "accountsChanged", etc.
      console.log("session_event", event);
    });

    this.signClient.on("session_update", ({ topic, params }) => {
      console.log("session_update", topic, params);

      const { namespaces } = params;
      const _session = this.signClient.session.get(topic);
      // Overwrite the `namespaces` of the existing session with the incoming one.
      const updatedSession = { ..._session, namespaces };
      // Integrate the updated session state into your dapp state.
      //onSessionUpdate(updatedSession);
    });

    this.signClient.on("session_delete", () => {
      // Session was deleted -> reset the dapp state, clean up from user session, etc.
      console.log("session_delete", event);
    });
  }

  private async connect(): Promise<SessionTypes.Struct> {
    console.log("WalletConnectV2 connecting");

    try {
      const { uri, approval } = await this.signClient.connect({
        // Optionally: pass a known prior pairing (e.g. from `signClient.core.pairing.getPairings()`) to skip the `uri` step.
        //pairingTopic: pairing?.topic,
        // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
        requiredNamespaces: requiredNamespaces,
      });

      console.log("WalletConnectV2 connection complete with uri:", uri);

      // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
      if (uri) {
        console.log("WalletConnectV2 opening modal");

        QRCodeModal.open(uri, () => {
          console.log("EVENT", "QR Code Modal closed");
        });
      }

      // Await session approval from the wallet.
      console.log("WalletConnectV2 awaiting for wallet approval");
      const session = await approval();
      // Handle the returned session (e.g. update UI to "connected" state).
      //await onSessionConnected(session);

      console.log("session", session);

      return session;
    } catch (e) {
      console.error(e);
    } finally {
      // Close the QRCode modal in case it was open.
      QRCodeModal.close();
    }

    return null;
  }

  public async createProvider(): Promise<UniversalProvider> {
    //  Initialize the provider
    console.log("Initializing the provider");
    const provider = await UniversalProvider.init({
      logger: "debug",
      projectId,
      relayUrl,
      metadata: walletMetadata,
      client: this.signClient, // optional instance of @walletconnect/sign-client
    });
    console.log("Provider created:", provider);

    // Only connect manually if there is no client ready yet
    if (!this.signClient) {
      console.log("No client passed. Manually connecting the provider");
      await provider.connect({
        namespaces: requiredNamespaces,
        //pairingTopic: "<123...topic>", // optional topic to connect to
        skipPairing: false, // optional to skip pairing ( later it can be resumed by invoking .pair())
      });
      console.log("Provider connected");
    }

    // set the default chain to 56
    console.log("Setting default provider chain");
    provider.setDefaultChain(`eip155:56`, 'https://bsc-something'); // We must provide at least a default chain id, or call request() with a chainid as second param, otherwise we get an exception.

    return provider;
  }

  public async sendTestCustomEthCall() {
    console.log("WalletConnectV2 sending test request");

    /* const result = await this.signClient.request({
      topic: this.session.topic,
      chainId: "eip155:56",
      request: {
        method: "personal_sign",
        params: [
          "0x1d85568eEAbad713fBB5293B45ea066e552A90De",
          "0x7468697320697320612074657374206d65737361676520746f206265207369676e6564",
        ],
      },
    }); */

    const result = await this.signClient.request({
      topic: this.session.topic,
      chainId: "eip155:56",
      request: {
        method: 'wallet_switchEthereumChain',
        params: [
          { chainId: '0x80' }
        ]
      }
    })
  }
}