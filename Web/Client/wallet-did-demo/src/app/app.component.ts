import { Component } from '@angular/core';
import { connectivity, DID } from "@elastosfoundation/elastos-connectivity-sdk-js";
import { EssentialsConnector } from "@elastosfoundation/essentials-connector-client-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public connectedName = null;
  public connectedDIDString = null;

  constructor() {
    connectivity.registerConnector(new EssentialsConnector());
  }

  async connect() {
    let didAccess = new DID.DIDAccess();
    let presentation = await didAccess.getCredentials({
      claims: {
        name: false
      }
    });

    if (presentation) {
      let nameCredential = presentation.getCredentials().find((c) => {
        return c.getId().getFragment() === "name";
      });
      if (nameCredential) {
        this.connectedName = nameCredential.getSubject().getProperty("name");
      }

      this.connectedDIDString = presentation.getHolder().toString();
    }
  }
}
