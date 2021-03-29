import { Component, OnInit } from '@angular/core';
import { NavController, AlertController} from '@ionic/angular';
import { NgZone} from '@angular/core';
import { Router } from '@angular/router';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;

enum DemoType {
  HIVE_DATABASE = 3,
  HIVE_FILES = 4,
  HIVE_SCRIPTING = 5,
  HIVE_ADVANCED_TESTS = 6
}

@Component({
  selector: 'app-hivedemolist',
  templateUrl: './hivedemolist.page.html',
  styleUrls: ['./hivedemolist.page.scss'],
})
export class HivedemolistPage implements OnInit {
  // Demo List
  public demoList: {name:string, type: DemoType}[] = [
    { "name": 'Database', "type": DemoType.HIVE_DATABASE },
    { "name": 'Files', "type": DemoType.HIVE_FILES },
    { "name": 'Scripting', "type": DemoType.HIVE_SCRIPTING },
    { "name": 'Advanced Tests', "type": DemoType.HIVE_ADVANCED_TESTS },
  ];

  constructor(
    public navCtrl: NavController,
    public zone: NgZone,
    public alertController:AlertController,
    public router: Router
  ) {}

  ngOnInit() {
  }

  ionViewWillEnter(){
    // When the main screen is ready to be displayed, ask the app manager to make the app visible,
    // in case it was started hidden while loading.
    appManager.setVisible("show");

    // Update system status bar every time we re-enter this screen.
    titleBarManager.setTitle('Demo List');
    titleBarManager.setBackgroundColor("#181d20");
    titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
  }

  /*
    0 =>IPFS
    1 =>onedrive
    2 =>KeyValue
  */
  go(demoType: DemoType):void {
    switch(demoType) {
      case DemoType.HIVE_DATABASE:
        this.router.navigate(["/hivedatabase"]);
        break;
      case DemoType.HIVE_SCRIPTING:
        this.router.navigate(["/hivescripting"]);
        break;
      case DemoType.HIVE_FILES:
        this.router.navigate(["/hivefiles"]);
        break;
      case DemoType.HIVE_ADVANCED_TESTS:
        this.router.navigate(["/advancedtests"]);
        break;
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Tips',
      message: 'Feature not yet available',
      buttons: ['Ok']
    });
    await alert.present();
  }
}
