import { Component } from '@angular/core';
import { connectivity, DID, localization, theme, Wallet } from "@elastosfoundation/elastos-connectivity-sdk-cordova";
import { localIdentity, LocalIdentityConnector } from "@elastosfoundation/elastos-connector-localidentity-cordova";
import { EssentialsConnector } from "@elastosfoundation/essentials-connector-cordova";
import { Platform } from '@ionic/angular';
import { Buffer } from 'buffer';
import { CURVE_TYPE, EcdsaSigner } from '../helper/ecdsasigner';
import { SHA256 } from '../helper/sha256';

declare let didManager: DIDPlugin.DIDManager;
declare let intentManager: IntentPlugin.IntentManager;
declare let hiveManager: HivePlugin.HiveManager;

enum WalletAddressType {
  WalletAddressType_btc_legacy = 'btclegacy',
  WalletAddressType_ela = 'elastosmainchain',
  WalletAddressType_evm = 'evm',
  WalletAddressType_iotex = 'iotex',
}

type WalletAddress = {
  addressType: WalletAddressType,
  address: string,
  publicKey: string,
  signature: string, // result of signature of concat(did, wallet address)
}


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private localIdentityConnector = new LocalIdentityConnector();
  private essentialsConnector = new EssentialsConnector();

  constructor(private platform: Platform) {
    this.platform.ready().then(async () => {
      this.init();
    });
  }

  private init() {
    console.log('init');

    didManager.setResolverUrl("https://api.elastos.io/eid", () => { });

    intentManager.addIntentListener((ret) => {
      this.onIntentReceived(ret);
    });
    console.log('intentManager.addIntentListener');

    connectivity.registerConnector(this.localIdentityConnector);
    connectivity.registerConnector(this.essentialsConnector);

    // Needed for hive authentication (app id credential)
    // TODO - Now this is friend's dapp DID. Need to create a DID for this test app and configure it
    // with proper redirect url, etc.
    //connectivity.setApplicationDID("did:elastos:ip8v6KFcby4YxVgjDUZUyKYXP3gpToPP8A");
    connectivity.setApplicationDID("did:elastos:iqtWRVjz7gsYhyuQEb1hYNNmWQt1Z9geXg") // Feeds app DID
  }

  async onIntentReceived(intent: IntentPlugin.ReceivedIntent) {
    console.log('Received intent', intent);
    try {
      console.log("sendIntentResponse");
      await intentManager.sendIntentResponse({ b: "2" }, intent.intentId);
    }
    catch (e) {
      console.error("sendIntentResponse error:", e);
      throw e;
    }
  }

  public async testIntent() {
    console.log("test Intent");

    intentManager.addIntentListener((ret) => {
      this.onIntentReceived(ret);
    });
    console.log('intentManager.addIntentListener');

    try {
      let ret = await intentManager.sendIntent("https://scanner.elastos.net/scanqrcode", { a: 1 });
      console.log('intent response:', ret);
      console.log("sendUrlIntent");
      await intentManager.sendUrlIntent("https://did.elastos.net/credaccess/eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkaWQ6ZWxhc3RvczppcVduUFJLWTltTktvUmRETXJrSGRlRHBRQmk0WnRvekQ0IiwiY2FsbGJhY2t1cmwiOiJodHRwczovL2FwaS5jeWJlcnJlcHVibGljLm9yZy9hcGkvdXNlci9sb2dpbi1jYWxsYmFjay1lbGEiLCJub25jZSI6IjZiNzkyZDVhLTBlYTItNDU4MC1hYWY2LWRiM2FjZjA2OGZiMiIsImNsYWltcyI6e30sIndlYnNpdGUiOnsiZG9tYWluIjoiaHR0cHM6Ly93d3cuY3liZXJyZXB1YmxpYy5vcmciLCJsb2dvIjoiaHR0cHM6Ly93d3cuY3liZXJyZXB1YmxpYy5vcmcvYXNzZXRzL2ltYWdlcy9jcl9lbGFfd2FsbGV0LnN2ZyJ9LCJpYXQiOjE2MTUxODYyNzUsImV4cCI6MTYxNTc5MTA3NX0._ppCH7YHd5SVoZHZI2YeYww6OlAjf5GIG3QqqSXf5rMw8oBmvdF7Nld_WMvnVQUvSnmnadRPZsYW66-Zi7T1Fg ");
    }
    catch (e) {
      console.error("sendIntent error:", e);
      throw e;
    }

    console.log("tested Intent");
  }

  public async testResolveDIDDocument() {

    //TMP
    didManager.generateMnemonic("FRENCH", (mnemonic) => { });

    didManager.resolveDidDocument("did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq", true, (doc) => {
      alert("DIDDOC: " + JSON.stringify(doc));
    });
  }

  public async testGetCredentials() {
    let didAccess = new DID.DIDAccess();
    console.log("Trying to get credentials");
    let presentation = await didAccess.getCredentials({
      claims: {
        name: true,
        avatar: {
          required: false,
          reason: "For test"
        },
        email: {
          required: false,
          reason: "For test"
        },
        gender: {
          required: false,
          reason: "For test"
        },
        telephone: {
          required: false,
          reason: "For test"
        },
        nation: {
          required: false,
          reason: "For test"
        },
        nickname: {
          required: false,
          reason: "For test"
        },
        description: {
          required: false,
          reason: "For test"
        },
        wallet: {
          required: false,
          reason: "For test"
        },
        interests: {
          required: false,
          reason: "For test"
        }
      }
    }
    );

    if (presentation) {
      console.log("Got credentials:", presentation);
      alert(JSON.stringify(presentation));

      this.verifyWalletCredentials(presentation);
    }
    else {
      alert("Empty presentation returned, something wrong happened, or operation was cancelled");
    }
  }

  private verifyWalletCredentials(presentation: any) {
    let credentials = presentation.verifiableCredential;
    if (credentials) {
      let walletCredential = credentials.find( c => {
        return c.credentialSubject.wallet;
      })

      if (walletCredential) {
        console.log("Got walletCredential:", walletCredential);
        let walletAddressList: WalletAddress[] = walletCredential.credentialSubject.wallet;

        walletAddressList.forEach( a => {
          let verify = false;

          // Get digest for did + address, then encode by sha256.
          let payload = walletCredential.credentialSubject.id + a.address;
          let digest = SHA256.encodeToBuffer(Buffer.from(payload));

          let curve_type = CURVE_TYPE.K1;

          // ELA mainchain use p256 curve.
          if (a.addressType == WalletAddressType.WalletAddressType_ela) {
            curve_type = CURVE_TYPE.R1
          }

          verify = EcdsaSigner.verify(curve_type, a.publicKey, Buffer.from(a.signature.replace('0x', ''), 'hex'), digest);
          if (!verify) {
            alert(JSON.stringify(walletCredential));
            return;
          }
        })
        alert('Wallet address verification successful!');
      }
    }
  }

  public async testPay() {
    let wallet = new Wallet.WalletAccess();
    console.log("Trying to get credentials");
    let response = await wallet.pay({ receiver: '0x0aD689150EB4a3C541B7a37E6c69c1510BCB27A4', amount: 0.01, memo: 'just test memo', currency: 'ELA/ETHSC' });
    console.log("pay respone", response);
  }

  public async testGetAppIDCredential() {
    let didAccess = new DID.DIDAccess();

    console.log(`Trying to get an app id credential`);

    let credential = await didAccess.generateAppIdCredential();
    console.log("App id credential:", credential);
  }

  // TODO: update Hive js sdk
  public testHiveAuth() {
  }
/*
  public async testHiveAuth() {
    let vault = await this.getVault();

    let callResult = await vault.getScripting().setScript("inexistingScript", hiveManager.Scripting.Executables.Database.newFindOneQuery("inexistingCollection"));
    console.log("Hive script call result:", callResult);
    if (callResult)
      alert("All good");
    else
      alert("Failed to call hive scripting API. Something wrong happened.");
  }

  private async getVault() {
    let authHelper = new Hive.AuthHelper();
    let hiveClient = await authHelper.getClientWithAuth((e) => {
      console.log('auth error');
    });
    console.log('getClientWithAuth:', hiveClient);

    let vault = await hiveClient.getVault("did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq");
    console.log("Got vault", vault);

    return vault;
  }
*/
  public async unselectActiveConnector() {
    connectivity.setActiveConnector(null);
  }

  public async revokeHiveAuthToken() {
    // TODO: update Hive js sdk
    // let vault = await this.getVault();
    // vault.revokeAccessToken();
  }

  public deleteLocalStorage() {
    window.localStorage.clear();
    window.location.href = "/";
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
  }
}
