import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIDButtonComponent } from '../components/did-button/did-button.component';

@NgModule({
  declarations: [DIDButtonComponent],
  imports: [
    CommonModule
  ],
  exports: [
    DIDButtonComponent
  ]
})
export class SharedModule { }
