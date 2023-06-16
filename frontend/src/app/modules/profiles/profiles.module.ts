import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';

import { CertificatesComponent } from './components/certificates/certificates.component';
import { ProfileBodyComponent } from './components/profile-body/profile-body.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProfilesRoutingModule } from './profiles-routing.module';
import { EndorseDialogComponent } from './components/endorse-dialog/endorse-dialog.component';

@NgModule({
  declarations: [ProfileBodyComponent, SkillsComponent, CertificatesComponent, ProjectsComponent, EndorseDialogComponent],
  imports: [CommonModule, ProfilesRoutingModule, SharedModule, ReactiveFormsModule],
})
export class ProfilesModule {}
