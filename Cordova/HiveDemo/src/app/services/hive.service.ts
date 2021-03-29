import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import * as TrinitySDK from '@elastosfoundation/trinity-dapp-sdk';
import { Events } from './events.service';

declare let hiveManager: HivePlugin.HiveManager;
declare let appManager: AppManagerPlugin.AppManager;

@Injectable({
  providedIn: 'root'
})
export class HiveService {
  private client: HivePlugin.Client;
  private didHelper: TrinitySDK.DID.DIDHelper;
  private hiveAuthHelper: TrinitySDK.Hive.AuthHelper;
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

    this.hiveAuthHelper = new TrinitySDK.Hive.AuthHelper();
    this.client = await this.hiveAuthHelper.getClientWithAuth((e)=>{
      // Auth error
      this.events.publish("autherror", e);
    })
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

      vault = await this.client.getVault(vaultOwnerDid);

      if (!vault) {
        await TrinitySDK.Hive.HiveHelper.suggestUserToSetupVault();
      }
      else {
        console.log("Resolved vault "+vaultOwnerDid+" from DID Document.");
        this.vaultsMap.set(vaultOwnerDid, vault);
      }

      resolve(vault);
    });
  }
}
