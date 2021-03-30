import { Component, ViewChild } from '@angular/core';
import { Platform , NavController, IonRouterOutlet } from '@ionic/angular';
import { HiveDemoService } from './services/hivedemo.service';
import { Router } from '@angular/router';
import { HiveService } from './services/hive.service';
import { StorageService } from './services/storage.service';
import { Hive , connectivity, DID, Wallet, localization, theme } from "@elastosfoundation/elastos-connectivity-sdk-cordova";
import { EssentialsConnector } from "@elastosfoundation/essentials-connector-cordova";
import { LocalIdentityConnector, localIdentity } from "@elastosfoundation/elastos-connector-localidentity-cordova";

@Component({
  selector: 'my-app',
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(IonRouterOutlet, {static: true}) routerOutlet: IonRouterOutlet;

  constructor(
    private platform: Platform,
    private navController: NavController,
    private hiveService: HiveService,
    private hiveDemoService: HiveDemoService,
    private router: Router,
    private storage: StorageService
   ){
     this.initializeApp();
   }

  initializeApp() {
    this.platform.ready().then(async () => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        this.setupBackKeyNavigation();

        // To be able to let users build a temporary identity in the app, without depending on a third party app:
        connectivity.registerConnector(new LocalIdentityConnector());

        // To let users use Essentials for his operations:
        connectivity.registerConnector(new EssentialsConnector());

        await this.hiveService.init();
        await this.hiveDemoService.init();

        let signedInDID = await this.storage.getSignedInDID();
        console.log("Signed in DID: ", signedInDID)
        if (signedInDID)
          this.navController.navigateRoot(['hivedemolist']);
        else
          this.navController.navigateRoot(['signin']);
      });
  }

  /**
   * Listen to back key events. If the default router can go back, just go back.
   * Otherwise, exit the application.
  */
  setupBackKeyNavigation() {
    this.platform.backButton.subscribeWithPriority(0, () => {
        if (this.routerOutlet && this.routerOutlet.canGoBack()) {
            this.routerOutlet.pop();
        } else {
            navigator['app'].exitApp();
        }
    });
  }

}
