import { Component, NgZone } from '@angular/core';
import { DID, DIDBackend, DIDStore, Issuer, Mnemonic, RootIdentity, VerifiableCredential } from "@elastosfoundation/did-js-sdk";
import { connectivity, DID as ConnDID, Wallet } from "@elastosfoundation/elastos-connectivity-sdk-js";
import { EssentialsConnector } from '@elastosfoundation/essentials-connector-client-browser';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private essentialsConnector = new EssentialsConnector();
  private walletConnectProvider: WalletConnectProvider;
  private web3: Web3;
  public infoMessage: string = "";

  constructor(private zone: NgZone) {
    connectivity.registerConnector(this.essentialsConnector);

    // Default: use injected
    this.useInjectedWeb3();

    // Default: use a test app DID for connectivity api calls
    this.useApplicationDID();
  }

  /************
   * SETUP
   ************/

  public async useInjectedWeb3() {
    // Disconnect WC
    this.disconnectWalletConnect();

    console.log("Creating injected Web3 from window.ethereum");
    if (window["ethereum"]) {
      this.web3 = new Web3(window["ethereum"]);
    }

    this.getActiveProvider().enable();
  }

  // https://docs.walletconnect.org/quick-start/dapps/web3-provider
  public async useCustomWalletConnect() {
    this.createWalletConnectProvider();
    await this.setupWalletConnectProvider();
  }

  public async useEssentialsWalletConnect() {
    this.walletConnectProvider = this.essentialsConnector.getWalletConnectProvider();
    if (!this.walletConnectProvider) {
      throw new Error("Essentials connector wallet connect provider is not initializez yet. Did you run some Elastos operations first?");
    }

    await this.setupWalletConnectProvider();
  }

  public async disconnectWalletConnect() {
    if (this.walletConnectProvider) {
      console.log("Disconnecting from wallet connect");
      //await this.walletConnectProvider.disconnect();
      if (this.essentialsConnector.getWalletConnectProvider())
        await this.essentialsConnector.disconnectWalletConnect(); // Essentials connector
      else
        await (await this.walletConnectProvider.getWalletConnector()).killSession(); // standalone WC provider
      console.log("Disconnected from wallet connect");
      this.walletConnectProvider = null;
      this.web3 = null;
    }
    else {
      console.log("Not connected to wallet connect");
    }
  }

  private getActiveProvider() {
    if (this.walletConnectProvider)
      return this.walletConnectProvider;
    else
      return window["ethereum"];
  }

  private getWeb3(): Web3 {
    return this.web3;
  }

  /**
   * Ask wallet authorization to read accounts (ie: metamask injected)
   */
  /* private async requestAccounts(): Promise<void> {
    console.log("Requesting accounts to provider");
    const accounts = await this.getActiveProvider().request({ method: 'eth_accounts' });
  } */

  private createWalletConnectProvider(): WalletConnectProvider {
    //  Create WalletConnect Provider
    this.walletConnectProvider = new WalletConnectProvider({
      rpc: {
        20: "https://api.elastos.io/eth",
        21: "https://api-testnet.elastos.io/eth",
        128: "https://http-mainnet.hecochain.com" // Heco mainnet
      },
      //bridge: "https://walletconnect.elastos.net/v1", // Tokyo, server with the website
      //bridge: "https://walletconnect.elastos.net/v2", // Tokyo, server with the website, v2.0 "relay" server
      //bridge: "https://wallet-connect.trinity-tech.cn/", // China
      //bridge: "https://walletconnect.trinity-tech.cn/v2",
      bridge: "https://c.bridge.walletconnect.org",
      //bridge: "https://walletconnect.trinity-feeds.app/" // Tokyo, standalone server
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
      console.log("ON DISCONNECT", code, reason);
    });

    // Subscribe to session disconnection
    this.walletConnectProvider.on("error", (code: number, reason: string) => {
      console.error(code, reason);
    });

    //  Enable session (triggers QR Code modal)
    console.log("Connecting to wallet connect");
    let enabled = await this.walletConnectProvider.enable();
    console.log("CONNECTED to wallet connect from tests", enabled, this.walletConnectProvider);

    this.web3 = new Web3(this.walletConnectProvider as any); // HACK
  }

  public useApplicationDID() {
    let callerDID = "did:elastos:in8oqWe4R4AswdJeFdhLDm6iGe6Ac4mqUJ"; // TestApp's DID
    connectivity.setApplicationDID(callerDID);
    console.log("Using application DID " + callerDID, connectivity);
  }

  public clearApplicationDID() {
    connectivity.setApplicationDID(null);
    console.log("Clearing application DID");
  }

  /************
   * IDENTITY
   ************/

  public async testGetCredentials() {
    this.infoMessage = "";

    let didAccess = new ConnDID.DIDAccess();
    console.log("Trying to get credentials");
    let presentation = await didAccess.getCredentials({
      claims: {
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
        hecoWallet: {
          required: false,
          reason: "For creda test"
        },
        testcredential: {
          required: false,
          reason: "For creda test"
        }
      }
    }
    );

    if (presentation) {
      console.log("Got credentials:", presentation);
      //console.log(JSON.stringify(presentation));

      let nameCredential = presentation.getCredentials().find((c) => {
        return c.getId().getFragment() === "name";
      });
      if (nameCredential) {
        this.zone.run(() => {
          this.infoMessage = "Thank you for signing in, " + nameCredential.getSubject().getProperty("name");
        });
      }
    }
    else {
      console.warn("Empty presentation returned, something wrong happened, or operation was cancelled");
    }
  }

  public async testRequestCredentials(testName: string) {
    this.infoMessage = "";

    let request: ConnDID.CredentialDisclosureRequest = null;
    switch (testName) {
      case 'nametype':
        request = {
          claims: [
            ConnDID.standardNameClaim("Your name").withNoMatchRecommendations([
              { title: "A provider", url: "https://the.provider.com/getAcredential", urlTarget: "external" }
            ])
          ]
        }
        break;
      case 'kyc':
        request = {
          claims: [
            ConnDID.standardNameClaim("Your name").withNoMatchRecommendations([
              { title: "Trinity-Tech KYC-Me", url: "https://kyc-me.trinity-tech.io", urlTarget: "internal" }
            ]),
            ConnDID.simpleTypeClaim("Your nationality", "NationalityCredential", true).withNoMatchRecommendations([
              { title: "Trinity-Tech KYC-Me", url: "https://kyc-me.trinity-tech.io", urlTarget: "internal" }
            ]),
            ConnDID.simpleTypeClaim("Your birth date", "BirthDateCredential", true).withNoMatchRecommendations([
              { title: "Trinity-Tech KYC-Me", url: "https://kyc-me.trinity-tech.io", urlTarget: "internal" }
            ])
          ]
        }
        break;
      case 'nameid':
        request = { claims: [ConnDID.simpleIdClaim("Your name", "name")] } // Equivalent to the deprecated getCredentials() with claim "name"
        break;
      case 'nameemailidopt':
        request = {
          claims: [
            ConnDID.simpleIdClaim("Your name", "name"),
            ConnDID.simpleIdClaim("Your email address", "email", false) // Optional email
          ]
        }
        break;
      case 'nameidwithinexistingissuer':
        request = {
          claims: [ConnDID.simpleIdClaim("Your name", "name").withIssuers([
            "did:elastos:inexisting",
            //"did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq"
          ])]
        } // Equivalent to the deprecated getCredentials() with claim "name"
        break;
    }

    let didAccess = new ConnDID.DIDAccess();
    console.log("Trying to request credentials");
    let presentation = await didAccess.requestCredentials(request);

    if (presentation) {
      console.log("Got presentation:", presentation);
    }
    else {
      console.warn("Empty presentation returned, something wrong happened, or operation was cancelled");
    }
  }

  public async testIssueCredentials() {
    let didAccess = new ConnDID.DIDAccess();
    let issuedCredential = await didAccess.issueCredential(
      "did:elastos:iqeXQuCuUuZ2mdHuPUhQpQGFs4HqHixm3G",
      ["TestCredentialType"],
      {
        "test": {
          "nested": 1234,
          "bool": true
        },
        "ok": "all right"
      },
      "testissue"
    );

    // Result of this issuance, depending on user
    console.log("Issued credentials:", issuedCredential);
  }

  public async testImportCredentials() {
    this._testImportCredentials(false);
  }

  public async testImportCredentialsAndPublish() {
    this._testImportCredentials(true);
  }

  private async _testImportCredentials(forcePublish: boolean) {
    this.infoMessage = "";

    console.log("Creating and importing a credential");
    let storeId = "client-side-store";
    let storePass = "unsafepass";
    let passphrase = ""; // Mnemonic passphrase

    // For this test, always re-create a new identity for the signer of the created credential.
    // In real life, the signer should remain the same.
    DIDBackend.initialize(new ConnDID.ElastosIODIDAdapter(ConnDID.ElastosIODIDAdapterMode.MAINNET));
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
    let credential = await vcb.id("#prescription").properties({
      prescription1: "Take 3 pills per day during one week.",
      displayable: {
        icon: "nowhere",
        title: "Medical certificate",
        description: "${prescription1}"
      }
    }).type("TestCredentialType").seal(storePass);
    console.log("Generated credential:", credential);

    // Send the credential to the identity wallet (essentials)
    let didAccess = new ConnDID.DIDAccess();
    let options: ConnDID.ImportCredentialOptions = {};
    if (forcePublish)
      options.forceToPublishCredentials = true;

    let importedCredentials = await didAccess.importCredentials([credential], options);

    // Result of this import, depending on user
    console.log("Imported credentials:", importedCredentials);
  }

  public async testDeleteCredential() {
    this.infoMessage = "";

    let didAccess = new ConnDID.DIDAccess();
    let credentialId = "#email";
    console.log("Trying to delete credentials");
    let deletedCredentials = await didAccess.deleteCredentials(credentialId);
    console.log("Deleted credentials:", deletedCredentials);
  }

  public async testDeleteCredentialAndPublish() {
    this.infoMessage = "";

    let didAccess = new ConnDID.DIDAccess();
    let credentialId = "#email";
    console.log("Trying to delete credentials (publish)");
    let deletedCredentials = await didAccess.deleteCredentials(credentialId, {
      forceToPublishCredentials: true
    });
    console.log("Deleted credentials:", deletedCredentials);
  }

  public async testRequestPublish() {
    this.infoMessage = "";

    let didAccess = new ConnDID.DIDAccess();
    console.log("Requesting DID publishing");
    let txId = await didAccess.requestPublish();
    console.log("Published DID txid:", txId);
  }

  public async testSignDIDData() {
    let didAccess = new ConnDID.DIDAccess();
    console.log("Trying to sign data with user's DID");
    let signedData = await didAccess.signData("data-to-sign", { extraField: 123 }, "customSignatureField");
    console.log("Signed data:", signedData);
  }

  public async testSetHiveAddress() {
    let didAccess = new ConnDID.DIDAccess();
    console.log("Trying to change hive vault address");
    //let status = await didAccess.updateHiveVaultAddress("https://my.vault.com", "My cool vault");
    let status = await didAccess.updateHiveVaultAddress("https://hive2.trinity-tech.io", "My cool vault");
    console.log("Hive address change result:", status);
  }

  public async testGetAppIDCredential(mode: string) {
    let didAccess = new ConnDID.DIDAccess();

    console.log(`Trying to get an app id credential (${mode})`);

    if (mode === "published")
      connectivity.setApplicationDID("did:elastos:in8oqWe4R4AswdJeFdhLDm6iGe6Ac4mqUJ"); // TestApp's DID
    else if (mode === "publishednoinfo")
      connectivity.setApplicationDID("did:elastos:ip8v6KFcby4YxVgjDUZUyKYXP3gpToPP8A"); // Unmaintained but published DID
    else
      connectivity.setApplicationDID("did:elastos:abcdef"); // Inexisting

    let credential = await didAccess.generateAppIdCredential();
    console.log("App id credential:", credential);
  }

  public async testDIDTransaction() {
    let connector = await this.walletConnectProvider.getWalletConnector();

    let didRequest = {
      "header": {
        "specification": "elastos/did/1.0",
        "operation": "update",
        "previousTxid": "8430c4f93f3662c071e796d93cca6b1d7ead8b6d4a8d008bb690f358446fc400"
      },
      "payload": "eyJpZCI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEiLCJwdWJsaWNLZXkiOlt7ImlkIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSNwcmltYXJ5IiwidHlwZSI6IkVDRFNBc2VjcDI1NnIxIiwiY29udHJvbGxlciI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEiLCJwdWJsaWNLZXlCYXNlNTgiOiJyeW44NFcyVlNQNHBuNFdUb2VyQmNCdlZQTDJra1J1Ym5tZWo2RUZnellVOSJ9XSwiYXV0aGVudGljYXRpb24iOlsiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSNwcmltYXJ5Il0sInZlcmlmaWFibGVDcmVkZW50aWFsIjpbeyJpZCI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEjYXZhdGFyIiwidHlwZSI6WyJCYXNpY1Byb2ZpbGVDcmVkZW50aWFsIiwiU2VsZlByb2NsYWltZWRDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEiLCJpc3N1YW5jZURhdGUiOiIyMDIxLTA3LTI5VDA3OjU1OjIyWiIsImV4cGlyYXRpb25EYXRlIjoiMjAyNi0wNy0yOFQwNzo1NToyMloiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEiLCJhdmF0YXIiOnsiY29udGVudC10eXBlIjoiaW1hZ2UvcG5nIiwiZGF0YSI6ImhpdmU6Ly9kaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxQGRpZDplbGFzdG9zOmlnMW5xeXlKaHdUY3RkTHlERmJab21TYlpTanlNTjF1b3IvZ2V0TWFpbklkZW50aXR5QXZhdGFyMTYyNzU0NTMxNDEzNz9wYXJhbXM9e1wiZW1wdHlcIjowfSIsInR5cGUiOiJlbGFzdG9zaGl2ZSJ9fSwicHJvb2YiOnsidHlwZSI6IkVDRFNBc2VjcDI1NnIxIiwiY3JlYXRlZCI6IjIwMjEtMDctMjlUMDc6NTU6MjJaIiwidmVyaWZpY2F0aW9uTWV0aG9kIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSNwcmltYXJ5Iiwic2lnbmF0dXJlIjoiSmg1azVEV1lMSzFhZWtWem5WQ1RaQUhTejNLSFhrM1JBQ0lvb2Q3cjFVYjN5eHR0aDJDNkVzMlRWSzhzLUhsdk1ncnJTZmpDMGhmbHRFS0V3bTAtS3cifX0seyJpZCI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEjZGVzY3JpcHRpb24iLCJ0eXBlIjpbIkJhc2ljUHJvZmlsZUNyZWRlbnRpYWwiLCJTZWxmUHJvY2xhaW1lZENyZWRlbnRpYWwiXSwiaXNzdWVyIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSIsImlzc3VhbmNlRGF0ZSI6IjIwMjEtMDYtMjRUMTQ6NTk6NDlaIiwiZXhwaXJhdGlvbkRhdGUiOiIyMDI2LTA2LTIzVDE0OjU5OjQ5WiIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSIsImRlc2NyaXB0aW9uIjoiRWxhc3RvcyBFc3NlbnRpYWxzIHRlYW0gbGVhZGVyIn0sInByb29mIjp7InR5cGUiOiJFQ0RTQXNlY3AyNTZyMSIsImNyZWF0ZWQiOiIyMDIxLTA2LTI0VDE0OjU5OjQ5WiIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEjcHJpbWFyeSIsInNpZ25hdHVyZSI6ImllUzN4ZUkxTURmVmI3TVFSMWI3MFRFVnl3VlpaY2lKNHJhcEE2SUxnMllVTy00WnBRTDJ2Q2x3emlqcUF4VWVGOFVvZHBwdHVuYlh3MTI0YlN0QVN3In19LHsiaWQiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxI2VsYUFkZHJlc3MiLCJ0eXBlIjpbIkJhc2ljUHJvZmlsZUNyZWRlbnRpYWwiLCJTZWxmUHJvY2xhaW1lZENyZWRlbnRpYWwiXSwiaXNzdWVyIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSIsImlzc3VhbmNlRGF0ZSI6IjIwMjEtMDgtMDZUMDU6Mzk6NTNaIiwiZXhwaXJhdGlvbkRhdGUiOiIyMDI2LTA4LTA1VDA1OjM5OjUzWiIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSIsImVsYUFkZHJlc3MiOiJFSzZSdEZVMU1EWWpDa3hZYjhlSGRRU3VqaWtQUGNNUGI1In0sInByb29mIjp7InR5cGUiOiJFQ0RTQXNlY3AyNTZyMSIsImNyZWF0ZWQiOiIyMDIxLTA4LTA2VDA1OjM5OjUzWiIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEjcHJpbWFyeSIsInNpZ25hdHVyZSI6IjhZSDI2X253QlNXbGdIRS1jT0ZxWUdPVTVydmZMOW8wYkhjMExVQllUNTdXNHFpeHVGOGQ5c3FmWlRzOWt4V3czc1UwclVDSzBCdWhXVW95bTBEWGNnIn19LHsiaWQiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxI2dlbmRlciIsInR5cGUiOlsiQmFzaWNQcm9maWxlQ3JlZGVudGlhbCIsIlNlbGZQcm9jbGFpbWVkQ3JlZGVudGlhbCJdLCJpc3N1ZXIiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxIiwiaXNzdWFuY2VEYXRlIjoiMjAyMS0wOC0xOVQwNjo0MzoyOVoiLCJleHBpcmF0aW9uRGF0ZSI6IjIwMjYtMDgtMThUMDY6NDM6MjlaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxIiwiZ2VuZGVyIjoibWFsZSJ9LCJwcm9vZiI6eyJ0eXBlIjoiRUNEU0FzZWNwMjU2cjEiLCJjcmVhdGVkIjoiMjAyMS0wOC0xOVQwNjo0MzoyOVoiLCJ2ZXJpZmljYXRpb25NZXRob2QiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxI3ByaW1hcnkiLCJzaWduYXR1cmUiOiJUNEJHWFQtY3E0Z1c2UloweVlKUWlLTUtBWFRHN1pTM1lRakxJdzBWSjVfVXVXVk9DbnBsZGpRLXE3aFFrREM4WmR6VUVhU3BiZXN6aTBIQU05bjUyUSJ9fSx7ImlkIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSNuYW1lIiwidHlwZSI6WyJCYXNpY1Byb2ZpbGVDcmVkZW50aWFsIiwiU2VsZlByb2NsYWltZWRDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEiLCJpc3N1YW5jZURhdGUiOiIyMDIxLTA4LTE5VDA2OjU5OjI4WiIsImV4cGlyYXRpb25EYXRlIjoiMjAyNi0wOC0xOFQwNjo1OToyOFoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEiLCJuYW1lIjoiQmVuamFtaW4gUGlldHRlIn0sInByb29mIjp7InR5cGUiOiJFQ0RTQXNlY3AyNTZyMSIsImNyZWF0ZWQiOiIyMDIxLTA4LTE5VDA2OjU5OjI4WiIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEjcHJpbWFyeSIsInNpZ25hdHVyZSI6IlVtSThxREs4M3dwWEFYRGgwTzVfc3dvVUk2Q1pvTnJFZENLdFcxUmJIT2RnRy1lQWd2YU5OamJDNlVZeGNQbUlUOVFuWWZsNko1eXlzTzA5dHk1cnlRIn19LHsiaWQiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxI25hdGlvbiIsInR5cGUiOlsiQmFzaWNQcm9maWxlQ3JlZGVudGlhbCIsIlNlbGZQcm9jbGFpbWVkQ3JlZGVudGlhbCJdLCJpc3N1ZXIiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxIiwiaXNzdWFuY2VEYXRlIjoiMjAyMS0wOC0xOVQwNjo1OToyOFoiLCJleHBpcmF0aW9uRGF0ZSI6IjIwMjYtMDgtMThUMDY6NTk6MjhaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxIiwibmF0aW9uIjoiRlJBIn0sInByb29mIjp7InR5cGUiOiJFQ0RTQXNlY3AyNTZyMSIsImNyZWF0ZWQiOiIyMDIxLTA4LTE5VDA2OjU5OjI4WiIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDplbGFzdG9zOmluc1RteGRERHVTOXdISGZlWUQxaDVDMm9uRUhoM0Q4VnEjcHJpbWFyeSIsInNpZ25hdHVyZSI6IlI5cno2QWZILWd5S1VDTHVYREJTM0NwVHJVOUNuaFptN0VpRWRubzBycTJQTWxxY2xkQkxkMVJ6VVRqRi0xOFlJbldzN3EzQ2RhaGR4bEdIRzl5Rk9RIn19LHsiaWQiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxI3R3aXR0ZXIiLCJ0eXBlIjpbIkJhc2ljUHJvZmlsZUNyZWRlbnRpYWwiLCJTZWxmUHJvY2xhaW1lZENyZWRlbnRpYWwiXSwiaXNzdWVyIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSIsImlzc3VhbmNlRGF0ZSI6IjIwMjEtMDgtMTlUMDY6NTk6MjhaIiwiZXhwaXJhdGlvbkRhdGUiOiIyMDI2LTA4LTE4VDA2OjU5OjI4WiIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSIsInR3aXR0ZXIiOiJAUHJvY3RhciJ9LCJwcm9vZiI6eyJ0eXBlIjoiRUNEU0FzZWNwMjU2cjEiLCJjcmVhdGVkIjoiMjAyMS0wOC0xOVQwNjo1OToyOFoiLCJ2ZXJpZmljYXRpb25NZXRob2QiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxI3ByaW1hcnkiLCJzaWduYXR1cmUiOiJIRGhHemJOeG5hYkk2UUdQTUlTVG5pWW1lN0pmLVB3RGJUMEhQUGxEMW5FOG9VZmttcTRfbENfQ2FnMHRHWlM5YXRPbFVVOWFtVVBhYmdrR0djTl9ZUSJ9fV0sInNlcnZpY2UiOlt7ImlkIjoiZGlkOmVsYXN0b3M6aW5zVG14ZEREdVM5d0hIZmVZRDFoNUMyb25FSGgzRDhWcSNoaXZldmF1bHQiLCJ0eXBlIjoiSGl2ZVZhdWx0Iiwic2VydmljZUVuZHBvaW50IjoiaHR0cHM6Ly9oaXZlMi50cmluaXR5LXRlY2guaW8ifV0sImV4cGlyZXMiOiIyMDI1LTAxLTA5VDA2OjM3OjUzWiIsInByb29mIjp7InR5cGUiOiJFQ0RTQXNlY3AyNTZyMSIsImNyZWF0ZWQiOiIyMDIxLTA4LTE5VDA4OjI5OjU5WiIsImNyZWF0b3IiOiJkaWQ6ZWxhc3RvczppbnNUbXhkRER1Uzl3SEhmZVlEMWg1QzJvbkVIaDNEOFZxI3ByaW1hcnkiLCJzaWduYXR1cmVWYWx1ZSI6Im8wOHliNk1fTDJmZEVfZmJsUG1LWFE1TG1RVTJhUmdBMUsycEttMWZZV0E3a3FHSEJLQU9qZHNHakJpX0dwSkZqa2VyNGlLQTFLb3dVTTdOSU5uV0pBIn19",
      "proof": {
        "type": "ECDSAsecp256r1",
        "verificationMethod": "did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq#primary",
        "signature": "tVQgJ-PpzwB-2_zvI6OLdh7CmvHztkjRclOvDwh4W5GwfNhdEFRH4uhwzLo90pHzC1Bie7hRGnU4Dh3XBwpyOQ"
      }
    };
    let request = {
      id: 1234567,
      jsonrpc: "2.0",
      method: "essentials_url_intent",
      params: [{
        url: "https://did.elastos.net/didtransaction/?didrequest=" + encodeURIComponent(JSON.stringify(didRequest))
      }]
    };
    console.log("Sending DID didtransaction as custom request to wallet connect", request);
    const result = await connector.sendCustomRequest(request);
    console.log("Got DID didtransaction custom request response", result);
  }

  /*****************
   * ELASTOS: OTHERS
   *****************/

  public async testPay() {
    let wallet = new Wallet.WalletAccess();
    console.log("Trying to get credentials");
    let response = await wallet.pay({ receiver: '0x0aD689150EB4a3C541B7a37E6c69c1510BCB27A4', amount: 0.0001, memo: 'just test memo', currency: 'ELA/ETHSC' });
    console.log("Pay response", response);
  }

  /************
   * ETHEREUM
   ************/

  public async testWalletConnectCustomRequest() {
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

  private async getUserAccount(): Promise<string> {
    let accounts = await this.getWeb3().eth.getAccounts();
    if (!accounts || accounts.length == 0) {
      throw new Error("No EVM account available");
    }
    return accounts[0];
  }

  public async testETHCall() {
    let contractAbi = require("../../assets/erc721.abi.json");
    let contractAddress = "0x5b462bac2d07223711aA0e911c846e5e0E787654"; // Elastos Testnet
    let contract = new (this.getWeb3()).eth.Contract(contractAbi, contractAddress);

    let gasPrice = await this.getWeb3().eth.getGasPrice();
    console.log("Gas price:", gasPrice);

    console.log("Sending transaction with account address:", await this.getUserAccount());
    let transactionParams = {
      from: await this.getUserAccount(),
      gasPrice: gasPrice,
      gas: 5000000,
      value: 0
    };

    let address = await this.getUserAccount();
    let tokenId = Math.floor(Math.random() * 10000000000);
    let tokenUri = "https://my.token.uri.com";
    console.log("Calling smart contract", address, tokenId, tokenUri);
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

  public async testInjectedETHCall() {
    let ethereum = (window as any).ethereum;
    let web3 = new Web3(ethereum);
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    let contractAbi = require("../../assets/erc721.abi.json");
    let contractAddress = "0x5b462bac2d07223711aA0e911c846e5e0E787654"; // Elastos Testnet
    let contract = new web3.eth.Contract(contractAbi, contractAddress);

    let gasPrice = await web3.eth.getGasPrice();
    console.log("Gas price:", gasPrice);

    console.log("Sending transaction with account address:", accounts[0]);
    let transactionParams = {
      from: accounts[0],
      gasPrice: gasPrice,
      gas: 5000000,
      value: 0
    };

    let address = accounts[0];
    let tokenId = Math.floor(Math.random() * 10000000000);
    let tokenUri = "https://my.token.uri.com";
    console.log("Calling MINT smart contract through wallet connect", address, tokenId, tokenUri);
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

  public async testSignTypedData() {
    let eip712TypedData = { "types": { "EIP712Domain": [{ "name": "name", "type": "string" }, { "name": "version", "type": "string" }, { "name": "chainId", "type": "uint256" }, { "name": "verifyingContract", "type": "address" }], "Permit": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }, { "name": "nonce", "type": "uint256" }, { "name": "deadline", "type": "uint256" }] }, "domain": { "name": "SushiSwap LP Token", "version": "1", "verifyingContract": "0x69E0E6d2783614f89dB5045aA374b68bAe646b3c", "chainId": 20 }, "primaryType": "Permit", "message": { "owner": "0xbA1ddcB94B3F8FE5d1C0b2623cF221e099f485d1", "spender": "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", "value": "259536627968409043", "nonce": 0, "deadline": 1634526493 } };

    let provider = this.getActiveProvider();

    const account = await this.getUserAccount();

    console.log("Asking to sign typed data for account", account);

    let data = JSON.stringify(eip712TypedData);
    let signedData = await provider.request({
      method: 'eth_signTypedData_v4',
      params: [account, data],
      from: account
    });

    console.log("Signed data:", signedData);
  }

  public async testEthSign() {
    const account = await this.getUserAccount();

    console.log("Calling eth_sign");

    var hash = this.getWeb3().utils.sha3("Message to sign");
    let signedData = await this.getActiveProvider().request({
      method: 'eth_sign',
      params: [account, hash],
      from: account
    });

    console.log("Signed eth_sign data:", signedData);
  }

  public async testPersonalSign() {
    let account = await this.getUserAccount();
    let message = "Here is a personal message to sign";
    const signature = await this.getActiveProvider().request({ method: 'personal_sign', params: [message, account] });
    console.log("Signature:", signature);
  }

  public async testAddERC20() {
    /* const tokenAddress = '0x71E1EF01428138e516a70bA227659936B40f0138';
    const tokenSymbol = 'CreDa';
    const tokenDecimals = 18;
    const tokenImage = 'http://placekitten.com/200/300'; */

    const tokenAddress = '0x2fceb9e10c165ef72d5771a722e8ab5e6bc85015';
    const tokenSymbol = 'BNA';
    const tokenDecimals = 18;
    const tokenImage = 'http://placekitten.com/200/300';

    try {
      const accounts = await this.getWeb3().eth.getAccounts();
      console.log("Accounts", accounts);

      const wasAdded = await this.getActiveProvider().request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        console.log('Token address added to wallet');
      }
      else {
        console.warn('Token address NOT added to wallet!');
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async testSwitchToElastos() {
    let provider = this.getActiveProvider();
    provider.request({
      method: 'wallet_switchEthereumChain', params: [
        { chainId: '0x14' }
      ]
    });
  }

  public async testSwitchToHeco() {
    let provider = this.getActiveProvider();
    provider.request({
      method: 'wallet_switchEthereumChain', params: [
        { chainId: '0x80' }
      ]
    });
  }

  public async testAddHecoNetwork() {
    let addParams = {
      blockExplorerUrls: ['https://hecoinfo.com'],
      chainId: "0x80",
      chainName: "Huobi ECO Chain",
      nativeCurrency: { name: 'HT', symbol: 'ht', decimals: 18 },
      rpcUrls: ['https://http-mainnet.hecochain.com', 'https://http-mainnet-node.huobichain.com'],
    }

    let provider = this.getActiveProvider();
    provider.request({
      method: 'wallet_addEthereumChain', params: [addParams]
    });
  }

  public async testAddRandomNetwork() {
    let randomChainId = "0x" + Math.floor(Math.random() * 16000).toString(16);
    let addParams = {
      blockExplorerUrls: ['https://hecoinfo.com'],
      chainId: randomChainId,
      chainName: "Random network " + randomChainId,
      nativeCurrency: { name: 'HT', symbol: 'ht', decimals: 18 },
      rpcUrls: ['https://http-mainnet.hecochain.com', 'https://http-mainnet-node.huobichain.com'],
    }

    let provider = this.getActiveProvider();
    provider.request({
      method: 'wallet_addEthereumChain', params: [addParams]
    });
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
    //this.essentialsConnector.disconnectWalletConnect();
  }

  public startCamera() {
    var constraints = {
      audio: false,
      video: true
    };

    console.log("navigator", navigator);
    console.log("navigator.mediaDevices", navigator.mediaDevices);

    navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
      var video = document.querySelector('video');
      video.srcObject = mediaStream;
      video.play();
    }).catch(function (err) {
      console.log("There's an error!" + err.message);
    });
  }

  public essNetHref() {
    const mobileLinkUrl = "https://essentials.elastos.net/wc";
    window.location.href = mobileLinkUrl;
  }

  public essNetWindow() {
    window.open("https://essentials.elastos.net/wc", '_blank');
  }
}

/*
function notCalledTest() {
  // OLD - finds a credential by ID
  appManager.sendIntent("credaccess", {
    claims: {
      email: true,
      name: {
        required: false,
        reason: "xxx"
      }
    }
  }); // --> Returns a VP

  // NEW - finds a credential by CREDENTIAL TYPE
  appManager.sendIntent("credaccess", {
    claims: {
      // New standard format:
      "did:elastos:trinitytech#EssentialsTelegramMembership": true,
      "schema.org/givenName": {
        required: false, // Optional credential
        reason: "To know your name"
      }
      // Backward compatibility / convenience:
      "email": true // Essentials will map to "schema.org/email" internally. Just for convenience to not break the few dapps we currently have
    }
  }); // --> Returns a VP
} */