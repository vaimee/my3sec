import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsComponent } from './skills/skills.component';
import { ProjectsComponent } from './projects/projects.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { MaterialModule } from 'app/material/material.module';



@NgModule({
  declarations: [
    SkillsComponent,
    ProjectsComponent,
    CertificatesComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    SkillsComponent,
    ProjectsComponent,
    CertificatesComponent,
  ]
})
export class SharedModule { }
