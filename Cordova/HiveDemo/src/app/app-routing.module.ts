import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HiveDatabasePage } from './pages/hivedatabase/hivedatabase.page';
import { HiveScriptingPage } from './pages/hivescripting/hivescripting.page';
import { HiveFilesPage } from './pages/hivefiles/hivefiles.page';
import { AdvancedTestsPage } from './pages/advancedtests/advancedtests.page';
import { OnboardPage } from './pages/onboard/onboard.page';
import { HivedemolistPage } from './pages/hivedemolist/hivedemolist.page';
import { SignInPage } from './pages/signin/signin.page';

const routes: Routes = [
  { path: 'signin', component: SignInPage },
  { path: 'onboard', component: OnboardPage },
  { path: 'hivedemolist', component: HivedemolistPage },
  { path: 'hivedatabase', component: HiveDatabasePage },
  { path: 'hivescripting', component: HiveScriptingPage },
  { path: 'hivefiles', component: HiveFilesPage },
  { path: 'advancedtests', component: AdvancedTestsPage },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
