import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { CertificatesComponent } from './components/certificates/certificates.component';
import { ProfileBodyComponent } from './components/profile-body/profile-body.component';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProfilesRoutingModule } from './profiles-routing.module';

@NgModule({
  declarations: [
    ProfileBodyComponent,
    ProfileHeaderComponent,
    SkillsComponent,
    CertificatesComponent,
    ProjectsComponent,
  ],
  imports: [CommonModule, ProfilesRoutingModule, SharedModule, ReactiveFormsModule],
})
export class ProfilesModule {}
