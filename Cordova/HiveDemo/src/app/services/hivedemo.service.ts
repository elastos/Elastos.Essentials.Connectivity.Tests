import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TitleBarComponent } from '../components/titlebar/titlebar.component';
import { TitleBarIconSlot } from '../components/titlebar/titlebar.types';

@Injectable({
    providedIn: 'root'
})
export class HiveDemoService {

    constructor(private navController: NavController) {
    }

    init() {
        console.log("HiveDemoService service init");
    }

    setTitleBarBackKeyShown(titleBar: TitleBarComponent, show: boolean) {
      if (show) {
          titleBar.setIcon(TitleBarIconSlot.OUTER_LEFT, {
              key: "back",
              iconPath: "assets/icons/back.svg"
          });
          this.registerBackKey(titleBar);
      }
      else {
          titleBar.setIcon(TitleBarIconSlot.OUTER_LEFT, null);
      }
    }

    public registerBackKey(titleBar: TitleBarComponent) {
        titleBar.addOnItemClickedListener((icon)=>{
            if (icon.key == "back")
                this.navController.back();
        });
    }
}
