import { Injectable, NgZone } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { TitleBarComponent } from '../components/titlebar/titlebar.component';

declare let intentManager: IntentPlugin.IntentManager;

let managerService = null;

@Injectable({
    providedIn: 'root'
})
export class DIDDemoService {
    private handledIntentId: Number;
    public connectApplicationProfileData: any;

    constructor(
        private platform: Platform,
        private navController: NavController,
        private toastCtrl: ToastController,
        public zone: NgZone) {
        managerService = this;
    }

    init() {
        console.log("Main service init");

        // Load app manager only on real device, not in desktop browser - beware: ionic 4 bug with "desktop" or "android"/"ios"
        if (this.platform.platforms().indexOf("cordova") >= 0) {
            console.log("Listening to intent events")
            intentManager.addIntentListener((intent: IntentPlugin.ReceivedIntent)=>{
                this.onReceiveIntent(intent);
            });
        }

        this.navController.navigateRoot("/home");
    }

    onReceiveIntent(ret: IntentPlugin.ReceivedIntent) {
        console.log("Intent received", ret);
        this.handledIntentId = ret.intentId;

        switch (ret.action) {
            case "connectapplicationprofile":
                console.log("Received connectapplicationprofile intent request");

                this.connectApplicationProfileData = ret.params;

                // Display the connection screen
                this.navController.navigateRoot("/connect");
                break;
        }
    }

    public toast(_message: string, duration: number = 4000): void {
        this.toastCtrl.create({
            message: _message,
            duration: duration,
            position: 'top'
        }).then(toast => toast.present());
    }

    public registerBackKey(titleBar: TitleBarComponent) {
        titleBar.addOnItemClickedListener((icon)=>{
            if (icon.key == "back")
                this.navController.back();
        });
    }
}
