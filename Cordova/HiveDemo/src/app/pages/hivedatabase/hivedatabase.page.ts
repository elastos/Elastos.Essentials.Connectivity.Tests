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
  selector: 'app-hivedatabase',
  templateUrl: './hivedatabase.page.html',
  styleUrls: ['./hivedatabase.page.scss'],
})
export class HiveDatabasePage implements OnInit {
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
    this.init();
  }

  async init() {
    this.events.subscribe("autherror", (e)=>{
      this.operationResultInfo = e;
    });
  }

  ionViewWillEnter() {
    this.hiveDemoService.setTitleBarBackKeyShown(true);
  }

  ionViewDidEnter() {
    titleBarManager.setTitle('Demo: Database');
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
    let signedInDID = await this.hiveService.getSelfDID();
    let vault = await this.hiveService.getVault(signedInDID);

    if (vault)
      this.operationResultInfo = "Found vault address: "+vault.getVaultProviderAddress();
    else
      this.operationResultInfo = "No vault address found!";

    return vault;
  }

  async createCollection() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Creating collection");
      let result = await vault.getDatabase().createCollection("testCollection");
      this.hideBusy();

      if (result && result.created) {
        console.log("Collection created");
        this.operationResultInfo = "Collection created";
      }
      else {
        console.log("Collection creation failure");
        this.operationResultInfo = "Collection could NOT be created...";
      }
    }
    catch (e) {
      console.error(e);
      this.operationResultInfo = "Exception while creating the collection... " + e;
    }
  }

  async deleteCollection() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Deleting collection");
      let result = await vault.getDatabase().deleteCollection("testCollection");
      this.hideBusy();

      if (result && result.deleted) {
        console.log("Collection deleted");
        this.operationResultInfo = "Collection deleted";
      }
      else {
        console.log("Collection deletion failure");
        this.operationResultInfo = "Collection could NOT be deleted...";
      }
    }
    catch (e) {
      console.error(e);
      this.operationResultInfo = "Exception while deleting the collection... " + e;
    }
  }

  async getEntries() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Getting existing entries");
      let entries = await vault.getDatabase().findMany("testCollection", {});
      this.hideBusy();

      if (entries) {
        console.log("Entries found", entries);
        this.operationResultInfo = "Entries found: ";
        for (let entry of entries) {
          this.operationResultInfo += JSON.stringify(entry) + " - ";
        }
      }
      else {
        this.operationResultInfo = "No new entry found...";
      }
    }
    catch (e) {
      console.error(e);
      this.operationResultInfo = "Exception while getting entries... " + e;
    }
  }

  async insertEntry() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Inserting entry");
      let insertResult = await vault.getDatabase().insertOne("testCollection", {
        myParam: "hey"
      });
      this.hideBusy();

      if (insertResult && insertResult.insertedId != null) {
        console.log("Entry inserted");
        this.operationResultInfo = "New entry successfully inserted with ID "+insertResult.insertedId;
      }
      else {
        this.operationResultInfo = "No new entry inserted...";
      }
    }
    catch (e) {
      console.error(e);
      this.operationResultInfo = "Exception while inserting the entry... " + e;
    }
  }

  async insertManyEntries() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Inserting entry");
      let insertResult = await vault.getDatabase().insertMany("testCollection", [
        {
          myParam: "hey"
        },
        {
          myParam: "another value",
          otherParam: "other value"
        }
      ]);
      this.hideBusy();

      if (insertResult && insertResult.insertedIds != null && insertResult.insertedIds.length > 0) {
        console.log("Entries inserted", insertResult);
        this.operationResultInfo = "New entries successfully inserted";
      }
      else {
        this.operationResultInfo = "No new entry inserted...";
      }
    }
    catch (e) {
      console.error(e);
      this.operationResultInfo = "Exception while inserting entries... " + e;
    }
  }

  async updateEntry() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Updating entry");
      let updateResult = await vault.getDatabase().updateOne("testCollection", {
        myParam: "hey" // Update the first entry that matches this filter
      }, {
        $set: {
          myParam: "hey",
          randomParam: Math.random()
        }
      });
      this.hideBusy();

      if (updateResult && updateResult.modifiedCount > 0) {
        console.log("Entry updated");
        this.operationResultInfo = "Entry successfully updated";
      }
      else {
        this.operationResultInfo = "No entry was updated...";
      }
    }
    catch (e) {
      console.error(e);
      this.operationResultInfo = "Exception while updating the entry... " + e;
    }
  }

  async deleteEntry() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Deleting entry");
      let deletionResult = await vault.getDatabase().deleteOne("testCollection", {
        myParam: "hey" // Delete the first entry that matches this filter
      });
      this.hideBusy();

      if (deletionResult && deletionResult.deletedCount > 0) {
        console.log("Entry deleted");
        this.operationResultInfo = "Entry successfully deleted";
      }
      else {
        this.operationResultInfo = "No entry was deleted...";
      }
    }
    catch (e) {
      console.error(e);
      this.operationResultInfo = "Exception while deleting the entry... " + e;
    }
  }
}
