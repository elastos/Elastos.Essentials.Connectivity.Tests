import { Component } from '@angular/core';
import { Hive , Connectivity } from "@elastosfoundation/elastos-connectivity-sdk-cordova";
import { EssentialsConnector } from "@elastosfoundation/essentials-connector-cordova";

declare let didManager: DIDPlugin.DIDManager;
declare let intentPlugin: IntentPlugin.Intent;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor() {
    intentPlugin.addIntentListener((ret) => {
      this.onIntentReceived(ret);
    });

    Connectivity.registerConnector(new EssentialsConnector());
  }

  async onIntentReceived(intent: IntentPlugin.ReceivedIntent) {
    console.log('Received intent', intent);
    try {
      console.log("sendIntentResponse");
      await intentPlugin.sendIntentResponse({b:"2"}, intent.intentId);
    }
    catch (e) {
        console.error("sendIntentResponse error:", e);
        throw e;
    }
  }

  public async testIntent() {
    console.log("test Intent");

    try {
      let ret = await intentPlugin.sendIntent("https://scanner.elastos.net/scanqrcode", {a: 1});
      console.log('intent response:', ret);
      console.log("sendUrlIntent");
      await intentPlugin.sendUrlIntent("https://did.elastos.net/credaccess/eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkaWQ6ZWxhc3RvczppcVduUFJLWTltTktvUmRETXJrSGRlRHBRQmk0WnRvekQ0IiwiY2FsbGJhY2t1cmwiOiJodHRwczovL2FwaS5jeWJlcnJlcHVibGljLm9yZy9hcGkvdXNlci9sb2dpbi1jYWxsYmFjay1lbGEiLCJub25jZSI6IjZiNzkyZDVhLTBlYTItNDU4MC1hYWY2LWRiM2FjZjA2OGZiMiIsImNsYWltcyI6e30sIndlYnNpdGUiOnsiZG9tYWluIjoiaHR0cHM6Ly93d3cuY3liZXJyZXB1YmxpYy5vcmciLCJsb2dvIjoiaHR0cHM6Ly93d3cuY3liZXJyZXB1YmxpYy5vcmcvYXNzZXRzL2ltYWdlcy9jcl9lbGFfd2FsbGV0LnN2ZyJ9LCJpYXQiOjE2MTUxODYyNzUsImV4cCI6MTYxNTc5MTA3NX0._ppCH7YHd5SVoZHZI2YeYww6OlAjf5GIG3QqqSXf5rMw8oBmvdF7Nld_WMvnVQUvSnmnadRPZsYW66-Zi7T1Fg ");
    }
    catch (e) {
      console.error("sendIntent error:", e);
      throw e;
    }

    console.log("tested Intent");
  }

  public async testResolveDIDDocument() {
    didManager.resolveDidDocument("did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq", true, (doc)=>{
      alert("DIDDOC: " + JSON.stringify(doc));
    });
  }

  public async testAuth() {
    let authHelper = new Hive.AuthHelper();
    let hiveClient = await authHelper.getClientWithAuth((e)=>{
      console.log('auth error');
    });
    console.log('getClientWithAuth:', hiveClient);

    let vault = await hiveClient.getVault("did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq");
    console.log("Got vault", vault);

    let callResult = await vault.getScripting().call("inexistingScript");
    console.log("Hive script call result:", callResult);
  }

  public async unselectActiveConnector() {
    Connectivity.setActiveConnector(null);
  }
}
