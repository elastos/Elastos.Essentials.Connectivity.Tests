import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { DID, Hive } from "@elastosfoundation/elastos-connectivity-sdk-cordova";
import { Events } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class HiveService {
  private _client: HivePlugin.Client;
  private didHelper: DID.DIDHelper;
  private hiveAuthHelper: Hive.AuthHelper;
  private vaultsMap = new Map<string, HivePlugin.Vault>();

  constructor(
    private router: Router,
    private storageService: StorageService,
    private iab: InAppBrowser,
    private storage: StorageService,
    private events: Events
  ) {}

  async init() {
    console.log("Initializing the hive service");

    this.hiveAuthHelper = new Hive.AuthHelper();
  }

  private async getOrCreateClient(): Promise<HivePlugin.Client> {
    if (!this._client) {
      this._client = await this.hiveAuthHelper.getClientWithAuth((e)=>{
        // Auth error
        this.events.publish("autherror", e);
      });
      console.log("A new hive client was created", this._client);
    }

    return this._client;
  }

  public async getSelfDID(): Promise<string> {
    return await this.storage.getSignedInDID();
  }

  public getOtherUserVaultInfo(): {did: string} {
    return {
      did: "did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq" // TMP TESTS
    }
  }

  public async getVault(vaultOwnerDid): Promise<HivePlugin.Vault> {
    return new Promise(async (resolve)=>{
      let vault: HivePlugin.Vault = null;

      // Use cached vault if we already know it.
      if (this.vaultsMap.has(vaultOwnerDid)) {
        console.log("Resolved vault "+vaultOwnerDid+" from cache/map.");
        resolve(this.vaultsMap.get(vaultOwnerDid));
        return;
      }

      let client = await this.getOrCreateClient();
      vault = await client.getVault(vaultOwnerDid);

      if (!vault) {
        await Hive.HiveHelper.suggestUserToSetupVault();
      }
      else {
        console.log("Resolved vault "+vaultOwnerDid+" from DID Document.");
        this.vaultsMap.set(vaultOwnerDid, vault);
      }

      resolve(vault);
    });
  }
}
