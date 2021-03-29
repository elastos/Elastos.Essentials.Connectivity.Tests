import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HiveDemoService } from 'src/app/services/hivedemo.service';
import { HiveService } from 'src/app/services/hive.service';
import { Events } from 'src/app/services/events.service';

declare let titleBarManager: TitleBarPlugin.TitleBarManager;
declare let hiveManager: HivePlugin.HiveManager;

@Component({
  selector: 'app-advancedtests',
  templateUrl: './advancedtests.page.html',
  styleUrls: ['./advancedtests.page.scss'],
})
export class AdvancedTestsPage implements OnInit {
  public operationResultInfo: string = "";
  public busy: boolean = false;

  constructor(
    public route: ActivatedRoute,
    public navCtrl: NavController,
    public zone: NgZone,
    public hiveDemoService: HiveDemoService,
    private hiveService: HiveService,
    private events: Events
  ) {
  }

  ngOnInit() {
    this.events.subscribe("autherror", (e)=>{
      this.operationResultInfo = e;
    });
  }

  ionViewWillEnter() {
    this.hiveDemoService.setTitleBarBackKeyShown(true);
  }

  ionViewDidEnter() {
    titleBarManager.setTitle('Demo: Files');
  }

  ionViewWillLeave() {
    this.hiveDemoService.setTitleBarBackKeyShown(false);
  }

  private showBusy() {
    this.busy = true;
  }

  private hideBusy() {
    this.busy = false;
  }

  private async getVault(): Promise<HivePlugin.Vault> {
    console.log("Getting vault instance");
    let did = await this.hiveService.getSelfDID();
    let vault = await this.hiveService.getVault(did);

    if (vault)
      this.operationResultInfo = "Found vault address: "+vault.getVaultProviderAddress()+" for DID "+did;
    else
      this.operationResultInfo = "No vault address found for did "+did+"!";

    return vault;
  }

  async revokeAccessToken() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Revoking access token");

    try {
      await vault.revokeAccessToken();
      console.log("Access token revoked");

      this.operationResultInfo = "Access token revoked";
    }
    catch (e) {
      console.error(e);
      console.log("Failed to revoke access token: "+e);
    }

    this.hideBusy();
  }

  async multipleParrallelCalls() {
    this.showBusy();

    console.log("Trying to get call several APIs at the same time");
    this.operationResultInfo = "Trying to call several APIs at the same time";

    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    await Promise.all([
      vault.getDatabase().createCollection("ParrallelCollection"),
      vault.getDatabase().createCollection("ParrallelCollection"),
      vault.getDatabase().createCollection("ParrallelCollection"),
      vault.getDatabase().createCollection("ParrallelCollection"),
      vault.getDatabase().createCollection("ParrallelCollection"),
      vault.getDatabase().createCollection("ParrallelCollection"),
    ]);

    console.log("Finished calling all APIs");
    this.operationResultInfo = "Finished calling all APIs";

    this.hideBusy();
  }
}
