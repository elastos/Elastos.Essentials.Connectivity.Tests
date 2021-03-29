import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { HomePage } from './pages/home/home';
import { SignPage } from './pages/sign/sign';
import { SignedInPage } from './pages/signedin/signedin';
import { CredIssuedPage } from './pages/credissued/credissued';
import { CredImportedPage } from './pages/credimported/credimported';

const routes: Routes = [
//   { path: '', redirectTo: 'home', pathMatch: 'full' }, // No default route.
  { path: 'home', component: HomePage },
  { path: 'sign', component: SignPage },
  { path: 'signedin', component: SignedInPage },
  { path: 'credissued', component: CredIssuedPage },
  { path: 'credimported', component: CredImportedPage },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, enableTracing: false })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
