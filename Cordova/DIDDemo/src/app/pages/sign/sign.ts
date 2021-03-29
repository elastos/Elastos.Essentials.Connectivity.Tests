import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { TitleBarIconSlot } from 'src/app/components/titlebar/titlebar.types';
import { DIDDemoService } from 'src/app/services/diddemo.service';

declare let intentPlugin: IntentPlugin.Intent;

type SignResult = {
  signingdid: string,
  publickey: string,
  signature: string
}

type SignIntentResponse = {
  result: SignResult
}

@Component({
  selector: 'page-sign',
  templateUrl: 'sign.html',
  styleUrls: ['sign.scss'],
})
export class SignPage {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;

  public dataToSign = "Hello elastOS";
  public dataSigned: boolean = false;
  public signResult: SignResult = null;

  constructor(public navCtrl: NavController, public didDemoService: DIDDemoService, private zone: NgZone) {
  }

  ionViewWillEnter() {
    this.dataSigned = false;

    this.titleBar.setTitle("DIDDemo @ Sign");
    this.setTitleBarBackKeyShown(true);
  }

  ionViewWillLeave() {
    this.setTitleBarBackKeyShown(false);
  }

  async signSampleData() {
    try {
      let responseData: SignIntentResponse = await intentPlugin.sendIntent("https://did.elastos.net/didsign", {
        data: this.dataToSign
      });
      console.log("Got intent response:", responseData);

      this.zone.run(()=>{
        if (responseData && responseData.result) {
          this.signResult = responseData.result;
          this.dataSigned = true;
        }
      });
    }
    catch(err) {
      console.error(err);
    }
  }

  setTitleBarBackKeyShown(show: boolean) {
    if (show) {
      this.titleBar.setIcon(TitleBarIconSlot.OUTER_LEFT, {
        key: "back",
        iconPath: "assets/icons/back.svg"
      });
      this.didDemoService.registerBackKey(this.titleBar);
    }
    else {
      this.titleBar.setIcon(TitleBarIconSlot.OUTER_LEFT, null);
    }
  }
}
