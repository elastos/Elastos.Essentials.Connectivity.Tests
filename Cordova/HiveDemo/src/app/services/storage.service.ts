import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) { }

  public set(key: string, value: any): Promise<any> {
    return this.storage.set(key, value);
  }

  public get<T>(key: string): Promise<T> {
      return this.storage.get(key);
  }

  public remove(key: string): any {
      return this.storage.remove(key);
  }

  public async getSignedInDID(): Promise<string> {
      return this.get<string>("signedindid");
  }

  public async setSignedInDID(didString: string): Promise<void> {
      return this.set("signedindid", didString);
  }

  public setVisit(value: boolean) {
    return this.storage.set("visited", JSON.stringify(value)).then((data) => {
      console.log('Set first visit', data);
    });
  }

  public getVisit(): Promise<boolean> {
    return this.storage.get("visited").then((data) => {
      console.log('Already visited', data);
      return JSON.parse(data);
    });
  }
}
