import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { TitleBarIconSlot } from 'src/app/components/titlebar/titlebar.types';
import { DIDDemoService } from 'src/app/services/diddemo.service';

@Component({
  selector: 'page-credimported',
  templateUrl: 'credimported.html',
  styleUrls: ['credimported.scss'],
})
export class CredImportedPage {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  
  constructor(
    public navCtrl: NavController,
    private zone: NgZone,
    public toastController: ToastController,
    private didDemoService: DIDDemoService
  ) {
  }

  ionViewDidEnter() {
    this.titleBar.setIcon(TitleBarIconSlot.OUTER_LEFT, {
      key: "back",
      iconPath: "assets/icons/back.svg"
    });
    this.didDemoService.registerBackKey(this.titleBar);

    this.titleBar.setTitle("Credential imported");
  }
}
