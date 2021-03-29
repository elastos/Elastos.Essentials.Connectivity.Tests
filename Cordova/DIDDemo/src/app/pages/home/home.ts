import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { TitleBarIconSlot } from 'src/app/components/titlebar/titlebar.types';
import { DID, connectivity } from "@elastosfoundation/elastos-connectivity-sdk-cordova";

declare let intentPlugin: IntentPlugin.Intent;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styleUrls: ['home.scss'],
})
export class HomePage {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;

  public did: string = "";
  public userName: string = "";
  public emailAddress: string = "";

  constructor(
    public navCtrl: NavController,
    private zone: NgZone,
    private navController: NavController,
    public toastController: ToastController
  ) {
  }

  ionViewWillEnter() {
    this.titleBar.setIcon(TitleBarIconSlot.OUTER_LEFT, null);
  }

  ionViewDidEnter() {
    this.titleBar.setTitle("DID Demo");
  }

  async signIn(customizationParams = null) {
    let intentParams = {
      claims: {
        name: true, // Mandatory to receive,
        email: {
          required: false, // User can choose to tell us his email address or not
          reason: "To send you a newsletter"
        }
      }
    };

    if (customizationParams) {
      /*customization: {
        primarycolorlightmode: string,
        primarycolordarkmode: string
      },*/
      intentParams["customization"] = customizationParams;
    }

    /**
     * Request some credentials to the DID application.
     */
    console.log("Signing in with request parameters:", intentParams);
    let didAccess = new DID.DIDAccess();
    let presentation = await didAccess.getCredentials(intentParams);
    if (presentation) {
      console.log("Received a presentation, so we are now signed in.");
      this.zone.run(()=>{
        this.navController.navigateForward("signedin", {
          queryParams: {
            did: presentation.getCredentials()[0].getIssuer(),
            presentation: presentation
          }
        });
      });
    }
  }

  signInCustomized() {
    this.signIn({
      primarycolorlightmode: "#92e28b",
      primarycolordarkmode: "#92e28b"
    });
  }

  signData() {
    this.navController.navigateForward(["/sign"]);
  }

  forgetIdentityConnector() {
    connectivity.setActiveConnector(null);
  }
}
