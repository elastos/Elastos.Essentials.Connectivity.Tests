import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { DIDDemoService } from './services/diddemo.service';
import { Hive , connectivity, DID, Wallet, localization, theme } from "@elastosfoundation/elastos-connectivity-sdk-cordova";
import { EssentialsConnector } from "@elastosfoundation/essentials-connector-cordova";
import { LocalIdentityConnector, localIdentity } from "@elastosfoundation/elastos-connector-localidentity-cordova";

@Component({
  selector: 'my-app',
  templateUrl: 'app.html'
})
export class MyApp {
  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    didDemoService: DIDDemoService
  ) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // To be able to let users build a temporary identity in the app, without depending on a third party app:
      connectivity.registerConnector(new LocalIdentityConnector());

      // To let users use Essentials for his operations:
      connectivity.registerConnector(new EssentialsConnector());

      // Initialize our custom app service to receive the "connect application profile" intent.
      didDemoService.init();
    });
  }
}
