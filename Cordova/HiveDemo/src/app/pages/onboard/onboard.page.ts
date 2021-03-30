import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TitleBarComponent } from 'src/app/components/titlebar/titlebar.component';
import { TitleBarForegroundMode, TitleBarNavigationMode } from 'src/app/components/titlebar/titlebar.types';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.page.html',
  styleUrls: ['./onboard.page.scss'],
})
export class OnboardPage implements OnInit {
  @ViewChild(TitleBarComponent, { static: true }) titleBar: TitleBarComponent;
  
  constructor(
    private storage: StorageService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter(){
    // Update system status bar every time we re-enter this screen.
    this.titleBar.setBackgroundColor("#181d20");
    // TODO titleBarManager.setTitle('Hive Demo ' + this.hiveService.version.slice(16,19));
    this.titleBar.setForegroundMode(TitleBarForegroundMode.LIGHT);
  }

  exit() {
    this.storage.setVisit(true);
    this.router.navigate(['hivedemolist']);
  }
}
