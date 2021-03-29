import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
declare let hiveManager:HivePlugin.HiveManager;


@Injectable({
  providedIn: 'root'
})
export class HiveService {

  public firstVisit = false;
  public version: string = "";
  public client:HivePlugin.Client = null;
  constructor(
    private router: Router,
    private storageService: StorageService,
    private iab: InAppBrowser,
  ) {}

  getClientObj(){
    return this.client;
  }
  init() {
    this.getVisit();
    this.getVersion();
  }

  getVisit() {
    this.storageService.getVisit().then(data => {
      if (data || data === true) {
          this.firstVisit = false;
          console.log('First visit?', this.firstVisit);
      } else {
          this.router.navigate(['onboard']);
      }
    });
  }

  deleteStorage() {
    this.storageService.setVisit(false);
  }

  /**
   * get Hive Version
   */
  getVersion() {
    hiveManager.getVersion((version: string) => {
      this.version = version
    }, (err: string) => {
      console.error("err: "+err);
    });
  }

  /**
  * hive createClient
  */
  createClient(hander:any,options:any):Promise<HivePlugin.Client> {
    return new Promise((resolve, reject)=>{
    try{
      hiveManager.createClient(
        hander,
        options,
        (info) => {
          resolve(info);
        }, (err) => {
          reject("err: "+err);
        });
    } catch(err) {
      reject("err: "+JSON.stringify(err));
    }});
  }

  /**
    * get IFPS Object
    *
    * parameter：{
                 driveType: "3"
                 };
    **/
  getIpfsObject():Promise<HivePlugin.IPFS>{
    //let options:HivePlugin.ClientCreationOptions ={driveType:HivePlugin.DriveType.IPFS};
    let type:string = HivePlugin.DriveType.IPFS.toString();
    let options:any ={ driveType:type };
    return new Promise((resolve, reject) => {
      try {
        this.createClient(null,options).then((client:HivePlugin.Client) => {
          try {
            client.getIPFS((ipfs:HivePlugin.IPFS) => {
              resolve(ipfs);
            },(err: string) => {
              reject("err: "+err);
            });
          } catch(err) {
            reject("err:"+err);
          }

        }).catch((err:string)=>{
          reject("err: "+err);
        });
      } catch (error) {
        reject("err: "+JSON.stringify(error));
    }});
  }

  /**
   * Put data to IPFS backend.
   *
   * @param content     The data to write.
   * @return
   *  {
        "status": "success",
        "cid": "QmVw47HJCmEtTou7c9d68iVJ1ce8Yxk4dAU1w5SGGWyyFh",
        "hid": null
      }
   **/
  ipfsPut(ipfs:HivePlugin.IPFS,content:string):Promise<any> {
    return new Promise((resolve, reject)=>{
      try {
        ipfs.put(content).then((result) => {
          resolve(result);
        }).catch((err:string) => {
          reject("err: " + err);
        });
      } catch (error) {
        reject("err: "+JSON.stringify(error));
      }
    });
  }

  /**
   * Get IPFS backend data through cid.
   *
   * @param data     Content identifiers.
   * @return
   * {
      "status": "success",
      "content": "sssssssss",
      "hid": null
     }
   * A promise object that contains success information will be returned on success,
   * otherwise a promise object that contains error information will be returned.
   **/
  ipfsGet(ipfs:HivePlugin.IPFS,cid:string): Promise<any> {
    return new Promise((resolve, reject)=>{
      try {
        ipfs.get(cid).then((result)=>{
          resolve(result);
        }).catch((err:string)=>{
            reject("err: "+err);
        });
      } catch (error) {
        reject("err: "+JSON.stringify(error));
      }
    });
  }

  /**
    * Get IPFS backend data length.
    *
    * @param data     Content identifiers.
    * @return
    *     {
            "status": "success",
            "length": 9,
            "hid": null
          }
    * A promise object that contains success information will be returned on success,
    * otherwise a promise object that contains error information will be returned.
    **/
  ipfsSize(ipfs:HivePlugin.IPFS,cid:string):Promise<any>{
    return new Promise((resolve, reject) => {
      try {
        ipfs.size(cid).then((result) => {
          resolve(result);
        }).catch((err:string) => {
          reject("err: "+err);
        });
      } catch (error) {
        reject("err: "+JSON.stringify(error));
      }
    });
  }

  /**
   * get KeyValues Obj
   *
   * parameter：{
             driveType: "3"
              };
   **/
  getKeyValuesObj():Promise<HivePlugin.KeyValues> {
    let type:string = HivePlugin.DriveType.ONEDRIVE.toString();
    let options:any = {
      driveType:type,
      clientId:"afd3d647-a8b7-4723-bf9d-1b832f43b881",
      redirectUrl: "http://localhost:12345"
      //redirectUrl:"https://scheme.elastos.org"
    };
    return new Promise((resolve, reject) => {
      try {
      this.createClient((url:string)=>{
        this.iab.create(url, "_system", "location=yes").show();
      },options).then((client: HivePlugin.Client) => {
        client.connect((info)=>{
            if(info === "success"){
                this.client = client;
                client.getKeyValues(
                    (keyValuesObj: HivePlugin.KeyValues) => {
                      resolve(keyValuesObj);
                      },
                    (err) => {
                      reject("err:  "+err);
                    }
                  );
                }
            }), ((err:string) => {
              reject("err:  "+err);
            });
        },(err)=>{
           reject(err);
        })
     }catch(err){
        reject(JSON.stringify(err));
     }
    });
  }

  putValue(
    keyValuesObj: HivePlugin.KeyValues,
    key: string,
    value: string
  ): Promise<any> {
    return new Promise((resolve, reject)=>{
      try {
        keyValuesObj.putValue(key,value).then(result => {
          resolve(result);
        }).catch((err) => {
          reject("err "+err);
        })
      } catch(err) {
        reject(JSON.stringify(err));
      }
    });
  }

  setValue(
    keyValuesObj: HivePlugin.KeyValues,
    key: string,
    value: string
  ): Promise<any> {
    return new Promise((resolve, reject)=>{
      try {
        keyValuesObj.setValue(key,value).then(result => {
          resolve(result);
        }).catch((err) => {
          reject("err "+err);
        })
      } catch(err) {
        reject(JSON.stringify(err));
      }
    });
  }

  getValues(
    keyValuesObj: HivePlugin.KeyValues,
    key: string,
  ): Promise<any> {
    return new Promise((resolve, reject)=>{
      try {
        keyValuesObj.getValues(key).then(result => {
          resolve(result);
        }).catch((err) => {
          reject("err "+err);
        })
      } catch(err) {
        reject(JSON.stringify(err));
      }
    });
  }

  deleteKey(
    keyValuesObj: HivePlugin.KeyValues,
    key: string,
  ): Promise<any> {
    return new Promise((resolve, reject)=>{
      try {
        keyValuesObj.deleteKey(key).then(result => {
          resolve(result);
        }).catch((err) => {
          reject("err "+err);
        })
      } catch(err) {
        reject(JSON.stringify(err));
      }
    });
  }

    /**
   * get KeyValues Obj
   *
   * parameter：{
             driveType: "3"
              };
   **/
  getFilesObj():Promise<HivePlugin.Files> {
    let type:string = HivePlugin.DriveType.ONEDRIVE.toString();
    let options:any = {
      driveType:type,
      clientId:"afd3d647-a8b7-4723-bf9d-1b832f43b881",
      redirectUrl: "http://localhost:12345"
      //redirectUrl:"https://scheme.elastos.org"
    };
    return new Promise((resolve, reject) => {
      try {
      this.createClient((url:string)=>{
        this.iab.create(url, "_system", "location=yes").show();
      },options).then((client: HivePlugin.Client) => {
        client.connect((info)=>{
            if(info === "success"){
                this.client = client;
                client.getFiles(
                    (filesObj: HivePlugin.Files) => {
                      resolve(filesObj);
                      },
                    (err) => {
                      reject("err:  "+err);
                    }
                  );
                }
            }, (err:string) => {
              reject("err:  "+err);
            });
        },(err)=>{
           reject(err);
        })
     }catch(err){
        reject(JSON.stringify(err));
     }
    });
  }

  filePut(fileObj: HivePlugin.Files,
          remoteFile: string,
          data: string):Promise<any>{
      return new Promise((resolve, reject)=>{
            try {
                fileObj.put(remoteFile,data).then((result)=>{
                    resolve(result)
                }).catch((err)=>{
                    reject("err "+err);
                })
            } catch (error) {
                reject(JSON.stringify(error));
            }
      });
  }

  fileGetAsString(fileObj: HivePlugin.Files,
    remoteFile: string):Promise<any>{
    return new Promise((resolve, reject)=>{
      try {
          fileObj.getAsString(remoteFile).then((result)=>{
              resolve(result)
          }).catch((err)=>{
              reject("err "+err);
          })
      } catch (error) {
          reject(JSON.stringify(error));
      }
   });
  }

  fileSize(fileObj: HivePlugin.Files,
    remoteFile: string):Promise<any>{
    return new Promise((resolve, reject)=>{
      try {
          fileObj.size(remoteFile).then((result)=>{
              resolve(result)
          }).catch((err)=>{
              reject("err "+err);
          })
      } catch (error) {
          reject(JSON.stringify(error));
      }
   });
  }

  deleteFile(fileObj: HivePlugin.Files,
    remoteFile: string):Promise<any>{
    return new Promise((resolve, reject)=>{
      try {
          fileObj.deleteFile(remoteFile).then((result)=>{
              resolve(result)
          }).catch((err)=>{
              reject("err "+err);
          })
      } catch (error) {
          reject(JSON.stringify(error));
      }
   });
  }

  fileList(fileObj: HivePlugin.Files):Promise<any>{
    return new Promise((resolve, reject)=>{
      try {
          fileObj.list().then((result)=>{
              resolve(result)
          }).catch((err)=>{
              reject("err "+err);
          })
      } catch (error) {
          reject(JSON.stringify(error));
      }
   });
  }


}
