import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { MaterialModule } from 'app/material/material.module';
import { MetamaskLoginComponent } from './components/metamask-login/metamask-login.component';
import { MetamaskNotInstalledComponent } from './components/metamask-not-installed/metamask-not-installed.component';
import { WrongChainComponent } from './components/wrong-chain/wrong-chain.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ProfileExistsComponent } from './components/profile-exists/profile-exists.component';

@NgModule({
  declarations: [
    MetamaskNotInstalledComponent,
    WrongChainComponent,
    MetamaskLoginComponent,
    SignUpComponent,
    ProfileExistsComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AuthModule {}
