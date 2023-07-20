import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { OrganizationsModule } from '@organizations/organizations.module';
import { ProjectsModule } from '@projects/projects.module';

import { CertificatesComponent } from './components/certificates/certificates.component';
import { EndorseDialogComponent } from './components/endorse-dialog/endorse-dialog.component';
import { EndorsersListComponent } from './components/endorsers-list/endorsers-list.component';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { SkillsComponent } from './components/skills/skills.component';
import { UpdateProfileComponent } from './components/update-profile/update-profile.component';
import { ProfilesRoutingModule, routedComponents } from './profiles-routing.module';

@NgModule({
  declarations: [
    routedComponents,
    SkillsComponent,
    CertificatesComponent,
    EndorseDialogComponent,
    EndorsersListComponent,
    ProfileListComponent,
    UpdateProfileComponent,
  ],
  imports: [
    CommonModule,
    ProfilesRoutingModule,
    ProjectsModule,
    SharedModule,
    ReactiveFormsModule,
    OrganizationsModule,
  ],
  exports: [ProfileListComponent],
})
export class ProfilesModule {}
