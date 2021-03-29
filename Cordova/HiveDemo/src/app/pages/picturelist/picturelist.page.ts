import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NgZone} from '@angular/core';
import { HiveDemoService } from 'src/app/services/hivedemo.service';

declare let appManager: AppManagerPlugin.AppManager;
declare let titleBarManager: TitleBarPlugin.TitleBarManager;


@Component({
  selector: 'app-picturelist',
  templateUrl: './picturelist.page.html',
  styleUrls: ['./picturelist.page.scss'],
})
export class PicturelistPage implements OnInit {

  public cidArr: any;
  public currentImage: string = "";

  // TODO public ipfsObj:HivePlugin.IPFS = null;
  public skey: string = "elastos.trinity.dApps.demo.hive";

  public isShowCamera = false;
  public isShowUpload = false;

  constructor(
    public navCtrl: NavController,
    public zone: NgZone,
    public hiveDemoService: HiveDemoService
    ){
    this.cidArr = this.getCidArr();
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    // When the main screen is ready to be displayed, ask the app manager to make the app visible,
    // in case it was started hidden while loading.
    appManager.setVisible("show");

    // Update system status bar every time we re-enter this screen.
    // TODO titleBarManager.setTitle('Hive Demo ' + this.hiveService.version.slice(16,19));
    titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);

    /* TODO console.log("==msg==" + this.ipfsObj);
    if(this.ipfsObj === null){
      this.hiveService.getIpfsObject().then((ipfs:HivePlugin.IPFS)=>{
            this.ipfsObj = ipfs;
      }).catch((err)=>{
          alert(err);
      });
    }*/
  }

  ionViewWillEnter() {
    this.hiveDemoService.setTitleBarBackKeyShown(true);
  }

  ionViewWillLeave() {
    this.hiveDemoService.setTitleBarBackKeyShown(false);
  }

  takePicture():void {
    this.isShowCamera = true;
    this.currentImage = "";
    const options = {
      quality: 100,
      destinationType: 0,
      encodingType: 0,
      mediaType:0
    };

    navigator.camera.getPicture((imageData) => {
      this.zone.run(() => {
        this.isShowCamera = false;
        this.currentImage = 'data:image/png;base64,' + imageData;
      });
    }, ((err) => {
      this.isShowCamera = false;
      console.log("Camera issue: " + err);
      this.currentImage ="";
    }), options);
  }

  putStringIpfs(content: string):void {
    this.isShowUpload = true;
    /* TODO this.hiveService.ipfsPut(this.ipfsObj,content).then((result) => {
      if(result["status"] === "success") {
          let cid = result["cid"];
          let obj = {"cid":cid,"no":(this.cidArr.length+1)}
          this.cidArr.push(obj);
          this.saveCidArr(this.cidArr);
          this.currentImage = "";
          this.isShowUpload = false;
        }
    }).catch((err) => {
      this.isShowUpload = false;
      alert(err);
    });*/
  }

  saveCidArr(arr:[]):void {
    localStorage.setItem(this.skey,JSON.stringify(arr))
  }

  getCidArr() {
    let arrStr = localStorage.getItem(this.skey) || "";
    if(arrStr === ""){
      return [];
    } else {
      return JSON.parse(arrStr);
    }
  }

  go(cid:string):void {
    this.navCtrl.navigateForward('/picturedetails', { queryParams: { "cid" : cid } });
  }

  reset() {
    this.isShowCamera = false;
    this.isShowUpload = false;
    this.currentImage = "";
  }
}
