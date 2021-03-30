import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HiveDemoService } from 'src/app/services/hivedemo.service';
import { HiveService } from 'src/app/services/hive.service';
import { access } from 'fs';
import { Events } from 'src/app/services/events.service';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';

declare let hiveManager: HivePlugin.HiveManager;

@Component({
  selector: 'app-hivescripting',
  templateUrl: './hivescripting.page.html',
  styleUrls: ['./hivescripting.page.scss'],
})
export class HiveScriptingPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  
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
    this.hiveDemoService.setTitleBarBackKeyShown(this.titleBar, true);
    this.titleBar.setTitle('Demo: Scripting');
  }

  ionViewDidEnter() {
  }

  ionViewWillLeave() {
    this.hiveDemoService.setTitleBarBackKeyShown(this.titleBar, false);
  }

  private showBusy() {
    this.busy = true;
  }

  private hideBusy() {
    this.busy = false;
  }

  private async getVault(): Promise<HivePlugin.Vault> {
    console.log("Getting vault instance");
    let vault = await this.hiveService.getVault(await this.hiveService.getSelfDID());

    if (vault)
      this.operationResultInfo = "Found vault address: "+vault.getVaultProviderAddress();
    else
      this.operationResultInfo = "No vault address found!";

    return vault;
  }

  async setScriptFindOneQuery() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Creating script execution sequence");
    let executionSequence = hiveManager.Scripting.Executables.newAggregatedExecutable([
      hiveManager.Scripting.Executables.Database.newFindOneQuery("testCollection", {
        myParam: "$params.testParam"
      }, null, true)
    ]);

    try {
      console.log("Registering find one query script");
      let wasCreated = await vault.getScripting().setScript("findOneQueryScript", executionSequence);
      if (wasCreated) {
        console.log("Script created");
        this.operationResultInfo = "Script created.";
      }
      else {
        console.log("Script creation has failed (unknown reason)");
        this.operationResultInfo = "Script creation has failed (unknown reason).";
      }
    }
    catch (e) {
      console.error(e);
      console.log("Failed to create script: "+e);
    }
    this.hideBusy();
  }

  async callScriptFindOneQuery() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Calling script");
      let scriptResult = await vault.getScripting().call("findOneQueryScript", {
        testParam: "hey"
      });
      console.log("Script result: ", scriptResult);

      this.operationResultInfo = "Script result: "+JSON.stringify(scriptResult);
    }
    catch(e) {
      console.error(e);
      console.log("Failed to call script: "+e);
    }
    this.hideBusy();
  }

  async setScriptInsertQueryWithResultsCondition() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Creating script execution sequence");
    let executionSequence = hiveManager.Scripting.Executables.newAggregatedExecutable([
      hiveManager.Scripting.Executables.Database.newInsertQuery("testCollection", {
        myParam: "$params.testParam"
      }, null, true)
    ]);

    // Just check that our test collection has something inside
    let accessCondition = hiveManager.Scripting.Conditions.Database.newQueryHasResultsCondition("testCollection", {});

    try {
      console.log("Registering insert query + results condition script");
      let wasCreated = await vault.getScripting().setScript("insertQueryWithResultsScript", executionSequence, accessCondition);
      if (wasCreated) {
        console.log("Script created");
        this.operationResultInfo = "Script created.";
      }
      else {
        console.log("Script creation has failed (unknown reason)");
        this.operationResultInfo = "Script creation has failed (unknown reason).";
      }
    }
    catch (e) {
      console.error(e);
      console.log("Failed to create script: "+e);
    }
    this.hideBusy();
  }

  async callScriptInsertQueryWithResultsCondition() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Calling script");
      let scriptResult = await vault.getScripting().call("insertQueryWithResultsScript", {
        testParam: "hey"
      });
      console.log("Script result: ", scriptResult);

      this.operationResultInfo = "Script result: "+JSON.stringify(scriptResult);
    }
    catch(e) {
      console.error(e);
      console.log("Failed to call script: "+e);
    }
    this.hideBusy();
  }

  public async setScriptUploadFile() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Creating script execution sequence");
    let executionSequence = hiveManager.Scripting.Executables.newAggregatedExecutable([
      hiveManager.Scripting.Executables.Files.newUploadExecutable("myFile.txt")
    ]);

    try {
      console.log("Registering upload executable script");
      let wasCreated = await vault.getScripting().setScript("uploadScript", executionSequence);
      if (wasCreated) {
        console.log("Script created");
        this.operationResultInfo = "Script created.";
      }
      else {
        console.log("Script creation has failed (unknown reason)");
        this.operationResultInfo = "Script creation has failed (unknown reason).";
      }
    }
    catch (e) {
      console.error(e);
      console.log("Failed to create script: "+e);
    }
    this.hideBusy();
  }

  public async callScriptUploadFile() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Calling script");

      let scriptResult = await vault.getScripting().call("uploadScript") as {upload: {transaction_id: string}};
      console.log("Upload script call result:", scriptResult);

      if (scriptResult && scriptResult.upload && scriptResult.upload.transaction_id) {
        let writer = await vault.getScripting().uploadFile(scriptResult.upload.transaction_id);
        if (!writer) {
          console.log("Failed to get writer");
          this.operationResultInfo = "Failed to get a writer instance to upload the file";
        }
        else {
          console.log("Got writer instance.");
          this.operationResultInfo = "Got writer instance. Uploading";

          console.log("Writing data to file");
          let fileContent = new TextEncoder().encode("I'm uploading a file to a foreign vault through scripting.");
          await writer.write(fileContent);
          await writer.flush();
          await writer.close();

          console.log("File upload completed");

          this.operationResultInfo = "File uploaded successfully";
        }
      }
      else {
        console.log("Failed to call the upload script");
        this.operationResultInfo = "Failed to call the upload script" + scriptResult;
      }
    }
    catch(e) {
      console.error(e);
      console.log("Failed to call script: "+e);
    }
    this.hideBusy();
  }

  public async setScriptDownloadFile() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Creating script execution sequence");
    let executionSequence = hiveManager.Scripting.Executables.newAggregatedExecutable([
      hiveManager.Scripting.Executables.Files.newDownloadExecutable("myFile.txt")
    ]);

    try {
      console.log("Registering download executable script. Allow anonymous user and app");
      let wasCreated = await vault.getScripting().setScript("downloadScript", executionSequence, null, true, true);
      if (wasCreated) {
        console.log("Script created");
        this.operationResultInfo = "Script created.";
      }
      else {
        console.log("Script creation has failed (unknown reason)");
        this.operationResultInfo = "Script creation has failed (unknown reason).";
      }
    }
    catch (e) {
      console.error(e);
      console.log("Failed to create script: "+e);
    }
    this.hideBusy();
  }

  public async callScriptDownloadFile() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    try {
      console.log("Calling script");

      let scriptResult = await vault.getScripting().call("downloadScript") as {download: {transaction_id: string}};
      console.log("Download script call result:", scriptResult);

      if (scriptResult && scriptResult.download && scriptResult.download.transaction_id) {
        try {
          let reader = await vault.getScripting().downloadFile(scriptResult.download.transaction_id);
          if (!reader) {
            console.log("Failed to get reader");
            this.operationResultInfo = "Failed to get a reader instance to download the file";
          }
          else {
            console.log("Got reader instance.");

            console.log("Reading data from file");
            let fileParts: ArrayBuffer[] = [];
            let readContent: Uint8Array = null;
            const BYTES_TO_READ = 40;
            while (true) {
              readContent = await reader.read(BYTES_TO_READ);
              if (readContent && readContent.byteLength > 0) {
                fileParts.push(readContent);
              }
              else
                break; // No more content to read, stop looping.
            }
            let fileContent = new Blob(fileParts);
            await reader.close();

            if (fileContent && fileContent["text"]) {
              console.log("Got the whole file content", await fileContent['text']());

              let fileContentText = await fileContent['text'](); // Dirty way to workaround typescript build error.
              this.operationResultInfo = "File downloaded successfully: "+fileContentText;
            }
            else {
              console.log("Invalid fileContent or no fileContent.text() available", fileContent);
              this.operationResultInfo = "Download seems to have failed... Check console logs.";
            }
          }
        }
        catch (e) {
          console.error(e);
          console.log("Failure during file download: "+e);
        }
      }
      else {
        console.log("Failed to call the upload script");
        this.operationResultInfo = "Failed to call the upload script" + scriptResult;
      }
    }
    catch(e) {
      console.error(e);
      console.log("Failed to call script: "+e);
    }
    this.hideBusy();
  }
}
