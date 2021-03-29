import { Component, OnInit } from '@angular/core';
import { NavController, AlertController} from '@ionic/angular';
import { NgZone} from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;
declare let didManager: DIDPlugin.DIDManager;

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SignInPage implements OnInit {
  constructor(
    public navCtrl: NavController,
    public zone: NgZone,
    public alertController:AlertController,
    private storage: StorageService
  ) {}

  ngOnInit() {
  }

  ionViewDidEnter(){
    appManager.setVisible("show");

    // Update system status bar every time we re-enter this screen.
    titleBarManager.setTitle('Hive Demo');
    titleBarManager.setBackgroundColor("#181d20");
    titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
    titleBarManager.setNavigationMode(TitleBarPlugin.TitleBarNavigationMode.CLOSE);
  }

  signIn() {
    appManager.sendIntent("credaccess", {
      claims: {}
    }, {
      // TODO - RESTORE AFTER NATIVE CRASH (dongxiao) appId: "org.elastos.trinity.dapp.did" // Force receiving by the DID app
    }, async (response: {result: { did: string, presentation: string }})=>{
      console.log("Got credaccess response:", response);
      if (response && response.result.did) {
        console.log("Got DID info. Saving it and going to next screen");

        // We are "signed in". Save the DID to local storage.
        await this.storage.setSignedInDID(response.result.did);

        // Now to the next expected screen
        this.zone.run(()=>{
          this.navCtrl.navigateForward("hivedemolist");
        });
      }
      else {
        console.warn("No DID field returned by credaccess, there is something wrong.");
      }
    }, (err)=>{
      console.error(err);
    })
  }
}
