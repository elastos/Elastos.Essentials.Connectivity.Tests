import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;

@Injectable({
    providedIn: 'root'
})
export class HiveDemoService {

    constructor(private navController: NavController) {
    }

    init() {
        console.log("HiveDemoService service init");

        titleBarManager.setForegroundMode(TitleBarPlugin.TitleBarForegroundMode.LIGHT);
        titleBarManager.addOnItemClickedListener((menuIcon)=>{
          if (menuIcon.key == "back") {
              this.navController.back();
          }
        });
    }

    setTitleBarBackKeyShown(show: boolean) {
      if (show) {
          titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.INNER_LEFT, {
              key: "back",
              iconPath: TitleBarPlugin.BuiltInIcon.BACK
          });
      }
      else {
          titleBarManager.setIcon(TitleBarPlugin.TitleBarIconSlot.INNER_LEFT, null);
      }
    }
}
