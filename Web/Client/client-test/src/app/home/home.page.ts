import { Component, NgZone } from '@angular/core';
import { Hive , connectivity, DID as ConnDID, Wallet, localization, theme } from "@elastosfoundation/elastos-connectivity-sdk-js";
import { EssentialsConnector } from "@elastosfoundation/essentials-connector-client-browser";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import { DIDStore, Issuer, VerifiableCredential, DID, RootIdentity, Mnemonic, DIDBackend, DefaultDIDAdapter } from "@elastosfoundation/did-js-sdk";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private essentialsConnector = new EssentialsConnector();
  private walletConnectProvider: WalletConnectProvider;
  private walletConnectWeb3: Web3;
  public infoMessage: string = "";

  constructor(private zone: NgZone) {
    connectivity.registerConnector(this.essentialsConnector);

    // Needed for hive authentication (app id credential)
    // TODO - Now this is friend's dapp DID. Need to create a DID for this test app and configure it
    // with proper redirect url, etc.
    connectivity.setApplicationDID("did:elastos:ip8v6KFcby4YxVgjDUZUyKYXP3gpToPP8A");
  }

  public async testGetCredentials() {
    this.infoMessage = "";

    let didAccess = new ConnDID.DIDAccess();
    console.log("Trying to get credentials");
    let presentation = await didAccess.getCredentials({claims: {
        name: true,
        creda: false,
        avatar: {
          required: false,
          reason: "For test"
        },
        email: {
          required: false,
          reason: "For test"
        },
        hecoWallet:{
          required: false,
          reason: "For creda test"
        },
        testcredential:{
          required: false,
          reason: "For creda test"
        }
      }}
    );

    if (presentation) {
      console.log("Got credentials:", presentation);
      //console.log(JSON.stringify(presentation));

      let nameCredential = presentation.getCredentials().find((c) => {
        return c.getId().getFragment() === "name";
      });
      if (nameCredential) {
        this.zone.run(() => {
          this.infoMessage = "Thank you for signing in, "+nameCredential.getSubject().getProperty("name");
        });
      }
    }
    else {
      console.warn("Empty presentation returned, something wrong happened, or operation was cancelled");
    }
  }

  public async testImportCredentials() {
    this.infoMessage = "";

    console.log("Creating and importing a credential");
    let storeId = "client-side-store";
    let storePass = "unsafepass";
    let passphrase = ""; // Mnemonic passphrase

    // For this test, always re-create a new identity for the signer of the created credential.
    // In real life, the signer should remain the same.
    DIDBackend.initialize(new ConnDID.ElastosIODIDAdapter(ConnDID.ElastosIODIDAdapterMode.DEVNET));
    let didStore = await DIDStore.open(storeId);
    let rootIdentity = RootIdentity.createFromMnemonic(Mnemonic.getInstance().generate(), passphrase, didStore, storePass, true);
    console.log("Created identity:", rootIdentity);

    let issuerDID = await rootIdentity.newDid(storePass, 0, true); // Index 0, overwrite
    console.log("Issuer DID:", issuerDID);

    let issuer = new Issuer(issuerDID);
    console.log("Issuer:", issuer);

    let targetDID = DID.from("did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq");
    console.log("Target DID:", targetDID);

    // Create the credential
    let vcb = new VerifiableCredential.Builder(issuer, targetDID);
    let credential = await vcb.id("#creda").properties({
      wallet1: "xxxx",
      wallet2: "xxxx"
    }).type("TestCredentialType").seal(storePass);
    console.log("Generated credential:", credential);

    // Send the credential to the identity wallet (essentials)
    let didAccess = new ConnDID.DIDAccess();
    let importedCredentials = await didAccess.importCredentials([credential]);

    // Result of this import, depending on user
    console.log("Imported credentials:", importedCredentials);
  }

  public async testSignDIDData() {
    let didAccess = new ConnDID.DIDAccess();
    console.log("Trying to sign data with user's DID");
    let signedData = await didAccess.signData("data-to-sign", {extraField: 123}, "customSignatureField");
    console.log("Signed data:", signedData);
  }

  public async testPay() {
    let wallet = new Wallet.WalletAccess();
    console.log("Trying to get credentials");
    let response = await wallet.pay({receiver: '0x0aD689150EB4a3C541B7a37E6c69c1510BCB27A4', amount: 0.01, memo: 'just test memo', currency: 'ELA/ETHSC'});
    console.log("Pay response", response);
  }

  private createWalletConnectProvider(): WalletConnectProvider {
    //  Create WalletConnect Provider
    this.walletConnectProvider = new WalletConnectProvider({
      rpc: {
        20: "https://api.elastos.io/eth",
        21: "https://api-testnet.elastos.io/eth",
      },
      bridge: "https://walletconnect.elastos.net/v1"
      //bridge: "http://192.168.31.114:5001"
      //bridge: "http://192.168.1.6:5001"
    });
    return this.walletConnectProvider;
  }

  private async setupWalletConnectProvider() {
    console.log("Connected?", this.walletConnectProvider.connected);

    // Subscribe to accounts change
    this.walletConnectProvider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
    });

    // Subscribe to chainId change
    this.walletConnectProvider.on("chainChanged", (chainId: number) => {
      console.log(chainId);
    });

    // Subscribe to session disconnection
    this.walletConnectProvider.on("disconnect", (code: number, reason: string) => {
      console.log(code, reason);
    });

    // Subscribe to session disconnection
    this.walletConnectProvider.on("error", (code: number, reason: string) => {
      console.error(code, reason);
    });

    //  Enable session (triggers QR Code modal)
    console.log("Connecting to wallet connect");
    let enabled = await this.walletConnectProvider.enable();
    console.log("CONNECTED to wallet connect", enabled, this.walletConnectProvider);

    this.walletConnectWeb3 = new Web3(this.walletConnectProvider as any); // HACK
  }

  // https://docs.walletconnect.org/quick-start/dapps/web3-provider
  public async testWalletConnectConnectCustom() {
    this.createWalletConnectProvider();
    await this.setupWalletConnectProvider();
    this.essentialsConnector.setWalletConnectProvider(this.walletConnectProvider);

    //  Get Chain Id
    /* const chainId = await this.walletConnectWeb3.eth.getChainId();
    console.log("Chain ID: ", chainId);

    if (chainId != 20 && chainId != 21) {
      console.error("ERROR: Connected to wrong ethereum network "+chainId+". Not an elastos network. Check that the wallet app is using an Elastos network.");
      return;
    } */
  }

  public async testWalletConnectConnectFromEssentialsConnector() {
    this.walletConnectProvider = this.essentialsConnector.getWalletConnectProvider();
    if (!this.walletConnectProvider) {
      throw new Error("Essentials connector wallet connect provider is not initializez yet. Did you run some Elastos operations first?");
    }

    await this.setupWalletConnectProvider();
  }

  public async testWalletConnectCustomRequest() {
    interface RequestArguments {
      method: string;
      params?: unknown[] | object;
    }

    let connector = await this.walletConnectProvider.getWalletConnector();

    console.log("connector", connector);
    let request = {
      id: 1234567,
      jsonrpc: "2.0",
      method: "essentials_url_intent",
      params: [{
        url: "https://did.elastos.net/credaccess/?claims={\"email\":true}"
      }]
    };
    console.log("Sending custom request to wallet connect", request);
    const result = await connector.sendCustomRequest(request);
    console.log("Got custom request response", result);
  }

  public async testWalletConnectMint() {
    const accounts = await this.walletConnectWeb3.eth.getAccounts();

    let contractAbi = require("../../assets/erc721.abi.json");
    let contractAddress = "0x5b462bac2d07223711aA0e911c846e5e0E787654"; // Elastos Testnet
    let contract = new this.walletConnectWeb3.eth.Contract(contractAbi, contractAddress);

    let gasPrice = await this.walletConnectWeb3.eth.getGasPrice();
    console.log("Gas price:", gasPrice);

    console.log("Sending transaction with account address:", accounts[0]);
    let transactionParams = {
        from: accounts[0],
        gasPrice: gasPrice,
        gas: 5000000,
        value: 0
    };

    let address = accounts[0];
    let tokenId = Math.floor(Math.random()*10000000000);
    let tokenUri = "https://my.token.uri.com";
    console.log("Calling smart contract through wallet connect", address, tokenId, tokenUri);
    contract.methods.mint(address, tokenId, tokenUri).send(transactionParams)
        .on('transactionHash', (hash) => {
          console.log("transactionHash", hash);
        })
        .on('receipt', (receipt) => {
          console.log("receipt", receipt);
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          console.log("confirmation", confirmationNumber, receipt);
        })
        .on('error', (error, receipt) => {
          console.error("error", error);
        });
  }

  public async testWalletConnectDisconnect() {
    if (this.walletConnectProvider) {
      console.log("Disconnecting from wallet connect");
      //await this.walletConnectProvider.disconnect();
      await (await this.walletConnectProvider.getWalletConnector()).killSession();
      console.log("Disconnected from wallet connect");
      this.walletConnectProvider = null;
    }
    else {
      console.log("Not connected to wallet connect");
    }
  }

  /*public async testHiveAuth() {
    let vault = await this.getVault();

    let callResult = await vault.getScripting().setScript("inexistingScript", hiveManager.Scripting.Executables.Database.newFindOneQuery("inexistingCollection"));
    console.log("Hive script call result:", callResult);
    if (callResult)
      alert("All good");
    else
      alert("Failed to call hive scripting API. Something wrong happened.");
  }

  private async getVault(): Promise<HivePlugin.Vault> {
    let authHelper = new Hive.AuthHelper();
    let hiveClient = await authHelper.getClientWithAuth((e)=>{
      console.log('auth error');
    });
    console.log('getClientWithAuth:', hiveClient);

    let vault = await hiveClient.getVault("did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq");
    console.log("Got vault", vault);

    return vault;
  }
/*
  public async unselectActiveConnector() {
    connectivity.setActiveConnector(null);
  }

  public async revokeHiveAuthToken() {
    let vault = await this.getVault();
    vault.revokeAccessToken();
  }

  public deleteLocalStorage() {
    window.localStorage.clear();
  }

  public manageLocalIdentity() {
    localIdentity.manageIdentity();
  }

  public setLanguage(lang: string) {
    localization.setLanguage(lang);
  }

  public setDarkMode(useDarkMode: boolean) {
    theme.enableDarkMode(useDarkMode);
  }

  public registerEssentialsConnector() {
    connectivity.registerConnector(this.essentialsConnector);
  }

  public unregisterEssentialsConnector() {
    connectivity.unregisterConnector(this.essentialsConnector.name);
  }

  public registerLocalConnector() {
    connectivity.registerConnector(this.localIdentityConnector);
  }

  public unregisterLocalConnector() {
    connectivity.unregisterConnector(this.localIdentityConnector.name);
  }*/

  public testUnlinkEssentialsConnection() {
    this.essentialsConnector.unlinkEssentialsDevice();
  }
}
