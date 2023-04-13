import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillComponent } from './skill/skill.component';
import { MatIconModule } from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { CertificatesComponent } from './certificates/certificates.component';
import { ProjectsComponent } from './projects/projects.component';


@NgModule({
  declarations: [
    SkillComponent,
    CertificatesComponent,
    ProjectsComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
  ],
  exports: [SkillComponent, CertificatesComponent, ProjectsComponent]
})
export class SharedModule { }
