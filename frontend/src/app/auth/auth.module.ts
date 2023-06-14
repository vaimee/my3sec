import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from './../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { MetamaskLoginComponent } from './components/metamask-login/metamask-login.component';
import { MetamaskNotInstalledComponent } from './components/metamask-not-installed/metamask-not-installed.component';
import { ProfileExistsComponent } from './components/profile-exists/profile-exists.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { WrongChainComponent } from './components/wrong-chain/wrong-chain.component';

@NgModule({
  declarations: [
    MetamaskNotInstalledComponent,
    WrongChainComponent,
    MetamaskLoginComponent,
    SignUpComponent,
    ProfileExistsComponent,
  ],
  imports: [CommonModule, SharedModule, AuthRoutingModule, FormsModule, ReactiveFormsModule],
})
export class AuthModule {}
