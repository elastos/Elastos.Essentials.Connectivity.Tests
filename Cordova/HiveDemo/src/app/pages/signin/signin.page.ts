import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, AlertController} from '@ionic/angular';
import { NgZone} from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { DID, connectivity } from "@elastosfoundation/elastos-connectivity-sdk-cordova";
import { TitleBarForegroundMode } from 'src/app/components/titlebar/titlebar.types';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SignInPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;

  constructor(
    public navCtrl: NavController,
    public zone: NgZone,
    public alertController:AlertController,
    private storage: StorageService
  ) {}

  ngOnInit() {
  }

  ionViewDidEnter(){
    // Update system status bar every time we re-enter this screen.
    this.titleBar.setTitle('Hive Demo');
    this.titleBar.setBackgroundColor("#181d20");
    this.titleBar.setForegroundMode(TitleBarForegroundMode.LIGHT);
  }

  async signIn() {
    // Force picking a connector every time we need to sign in, just in case.
    await connectivity.setActiveConnector(null);

    let didAccess = new DID.DIDAccess();
    let presentation = await didAccess.getCredentials(
      {
        claims:{
          name: true
        }
      }
    );

    if (presentation) {
      console.log("Got DID info. Saving it and going to next screen");

      // We are "signed in". Save the DID to local storage.
      let did = presentation.getCredentials()[0].getSubject();
      await this.storage.setSignedInDID(did);

      // Now to the next expected screen
      this.zone.run(()=>{
        this.navCtrl.navigateForward("hivedemolist");
      });
    }
    else {
      console.warn("No DID field returned by credaccess, there is something wrong.");
    }
  }
}
