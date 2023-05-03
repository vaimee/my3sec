import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillComponent } from './components/skill/skill.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { MaterialModule } from 'app/material/material.module';



@NgModule({
  declarations: [
    SkillComponent,
    CertificatesComponent,
    ProjectsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [SkillComponent, CertificatesComponent, ProjectsComponent]
})
export class SharedModule { }
