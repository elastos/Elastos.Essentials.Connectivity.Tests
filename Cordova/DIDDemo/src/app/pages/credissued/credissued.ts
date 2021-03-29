import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DIDDemoService } from 'src/app/services/diddemo.service';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { TitleBarIconSlot } from 'src/app/components/titlebar/titlebar.types';

declare let intentPlugin: IntentPlugin.Intent;

@Component({
  selector: 'page-credissued',
  templateUrl: 'credissued.html',
  styleUrls: ['credissued.scss'],
})
export class CredIssuedPage {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;

  public rawIssuedCredential: any;

  constructor(
    public navCtrl: NavController,
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private navController: NavController,
    private didDemoService: DIDDemoService,
    public toastController: ToastController
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url.startsWith("/credissued")) {
        this.rawIssuedCredential = this.route.snapshot.queryParamMap.get("credential");
        console.log("CredIssuedPage got raw credential: "+JSON.stringify(this.rawIssuedCredential));
      }
    });
  }

  ionViewDidEnter() {
    this.titleBar.setIcon(TitleBarIconSlot.OUTER_LEFT, {
      key: "back",
      iconPath: "assets/icons/back.svg"
    });
    this.didDemoService.registerBackKey(this.titleBar);

    this.titleBar.setTitle("");
  }

  async importCredential() {
    let credentialAsObject = JSON.parse(this.rawIssuedCredential);

    /**
     * Ask the DID app to re-import the credential we just issued ourselves. This is possible because
     * the demo credential we have issued on the previous screen defined the subject DID as being ouself
     * (ourself issued a credential to ourself).
     */
    try {
      await intentPlugin.sendIntent("https://did.elastos.net/credimport", {
          credentials: [ // We can import several credentials at a time if needed
            credentialAsObject
          ]
      });
      this.zone.run(() => {
        this.navCtrl.navigateForward("credimported");
      })
    }
    catch(err) {
      this.didDemoService.toast("Failed to import the credential: "+JSON.stringify(err));
    };
  }
}
