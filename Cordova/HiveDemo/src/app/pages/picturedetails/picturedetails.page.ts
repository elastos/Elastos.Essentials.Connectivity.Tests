import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NgZone} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HiveDemoService } from 'src/app/services/hivedemo.service';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Component({
  selector: 'app-picturedetails',
  templateUrl: './picturedetails.page.html',
  styleUrls: ['./picturedetails.page.scss'],
})
export class PicturedetailsPage implements OnInit {

    public cid:string = "";
    public contentSize: string = "";
    public showCurrentImage: string = "";
    // TODO public ipfsObj:HivePlugin.IPFS=null;
    public isShow = false;

    constructor(
      public route:ActivatedRoute,
      public navCtrl: NavController,
      public zone:NgZone,
      public hiveDemoService: HiveDemoService
     ){
    }

    ngOnInit() {
       this.init();
    }

    init():void{
      /* TODO if(this.ipfsObj === null){
        this.hiveService.getIpfsObject().then((ipfs:HivePlugin.IPFS)=>{
            this.ipfsObj = ipfs;
            this.route.queryParams.subscribe((data)=>{
                      this.cid = data["cid"];
                      this.getSizeIpfs(this.cid);
                      this.getStringIpfs(this.cid);
                      titleBarManager.setTitle(this.cid.slice(0,10) + '...' + this.cid.slice(40,50));
                     });
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

    getStringIpfs(cid:string):void{
      this.isShow = true;
      /* TODO this.hiveService.ipfsGet(this.ipfsObj,cid).then((result)=>{
        if(result["status"] === "success"){
            this.showCurrentImage = result["content"];
            this.isShow = false;
          }
      }).catch((err:string)=>{
              this.isShow = false;
              alert(err);
      });*/
    }

    getSizeIpfs(cid:string):void{
     /* TODO this.hiveService.ipfsSize(this.ipfsObj,cid).then((result)=>{
        if(result["status"] === "success"){
            this.contentSize = result["length"];
          }
     }).catch((err:string)=>{
         alert(err);
     });*/
    }
}
