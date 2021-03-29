import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { MyApp } from './app.component';

import { IonicStorageModule } from '@ionic/storage';
import { HiveDatabasePage } from './pages/hivedatabase/hivedatabase.page';
import { HiveScriptingPage } from './pages/hivescripting/hivescripting.page';
import { HiveFilesPage } from './pages/hivefiles/hivefiles.page';
import { SignInPage } from './pages/signin/signin.page';
import { AdvancedTestsPage } from './pages/advancedtests/advancedtests.page';
import { OnboardPage } from './pages/onboard/onboard.page';
import { HivedemolistPage } from './pages/hivedemolist/hivedemolist.page';

@NgModule({
  declarations: [
    MyApp,
    OnboardPage,
    HivedemolistPage,
    HiveDatabasePage,
    HiveScriptingPage,
    HiveFilesPage,
    SignInPage,
    AdvancedTestsPage
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [MyApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    InAppBrowser,
    Platform,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: ErrorHandler, useClass: ErrorHandler}
  ]
})
export class AppModule {}
