import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, AlertController} from '@ionic/angular';
import { NgZone} from '@angular/core';
import { Router } from '@angular/router';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { TitleBarForegroundMode } from 'src/app/components/titlebar/titlebar.types';

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
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  
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
    // Update system status bar every time we re-enter this screen.
    this.titleBar.setTitle('Demo List');
    this.titleBar.setBackgroundColor("#181d20");
    this.titleBar.setForegroundMode(TitleBarForegroundMode.LIGHT);
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
