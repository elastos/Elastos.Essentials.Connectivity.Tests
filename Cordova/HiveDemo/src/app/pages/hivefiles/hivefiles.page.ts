import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HiveDemoService } from 'src/app/services/hivedemo.service';
import { HiveService } from 'src/app/services/hive.service';
import { Events } from 'src/app/services/events.service';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';

@Component({
  selector: 'app-hivefiles',
  templateUrl: './hivefiles.page.html',
  styleUrls: ['./hivefiles.page.scss'],
})
export class HiveFilesPage implements OnInit {
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
    this.events.subscribe("autherror", (e)=>{
      this.operationResultInfo = e;
    });
  }

  ionViewWillEnter() {
    this.hiveDemoService.setTitleBarBackKeyShown(this.titleBar, true);
    this.titleBar.setTitle('Demo: Files');
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
    let signedInDID = await this.hiveService.getSelfDID();
    let vault = await this.hiveService.getVault(signedInDID);

    if (vault)
      this.operationResultInfo = "Found vault address: "+vault.getVaultProviderAddress();
    else
      this.operationResultInfo = "No vault address found!";

    return vault;
  }

  async uploadFile() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Getting upload writer");

    try {
      let writer = await vault.getFiles().upload("myFile.txt");
      if (!writer) {
        console.log("Failed to get writer");
        this.operationResultInfo = "Failed to get a writer instance to upload the file";
      }
      else {
        console.log("Got writer instance.");

        console.log("Writing data to file");
        let fileContent = new TextEncoder().encode("Here is my UTF8 text: héçà - and some chinese: 你好中国")
        console.log("Written blob object:", fileContent);
        await writer.write(fileContent);

        console.log("Flushing file to stream");
        await writer.flush();
        await writer.close();

        console.log("File upload completed");

        this.operationResultInfo = "File uploaded successfully";
      }
    }
    catch (e) {
      console.error(e);
      console.log("Failed to get writer: "+e);
    }

    this.hideBusy();
  }

  async uploadBinaryFileChange(event) {
      let data: ArrayBuffer;
      console.log("File picked. Now uploading")
      //item.binary = event;
      var r = new FileReader();
      r.onload = (e) => {
        data = r.result as ArrayBuffer;
        console.log("Loaded data:", data);

        this.uploadBinaryFile(data);
      }
      r.readAsArrayBuffer(event.target.files[0]);
  }

  private async uploadBinaryFile(data: ArrayBuffer) {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Getting upload writer");

    try {
      let writer = await vault.getFiles().upload("myFile.bin");
      if (!writer) {
        console.log("Failed to get writer");
        this.operationResultInfo = "Failed to get a writer instance to upload the binary file";
      }
      else {
        console.log("Got writer instance.");

        console.log("Writing data to file");
        await writer.write(new Uint8Array(data));

        console.log("Flushing file to stream");
        await writer.flush();
        await writer.close();

        console.log("Binary file upload completed");

        this.operationResultInfo = "Binary file uploaded successfully";
      }
    }
    catch (e) {
      console.error(e);
      console.log("Failed to get writer: "+e);
    }

    this.hideBusy();
  }

  async downloadFile() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Getting download reader");

    try {
      let reader = await vault.getFiles().download("myFile.txt");
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
          console.log("Read file content (partial): ", readContent);
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

    this.hideBusy();
  }

  async getFileInfo() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Getting file information");

    try {
      let fileInfo = await vault.getFiles().stat("myFile.txt");
      if (!fileInfo) {
        console.log("Failed to get file info");
        this.operationResultInfo = "Failed to get file information";
      }
      else {
        console.log("Got file info", fileInfo);

        this.operationResultInfo = "Retrieved file info: "+JSON.stringify(fileInfo);
      }
    }
    catch (e) {
      console.error(e);
      console.log("Failed to get file info: "+e);
    }
    this.hideBusy();
  }

  async deleteFile() {
    this.showBusy();
    let vault = await this.getVault();
    if (!vault) {
      this.hideBusy();
      this.operationResultInfo = "Vault is null!"
      return;
    }

    console.log("Deleting file");

    try {
      let deleted = await vault.getFiles().delete("myFile.txt");
      if (!deleted) {
        console.log("Failed to delete file. Does this file exist?");
        this.operationResultInfo = "Failed to delete file";
      }
      else {
        console.log("File was deleted");

        this.operationResultInfo = "File successfully deleted";
      }
    }
    catch (e) {
      console.error(e);
      console.log("Failed to delete file: "+e);
    }
    this.hideBusy();
  }
}
