import { Component, Input } from '@angular/core';
import { Project } from 'app/user-profile/interfaces/project.interface';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  @Input() projects!: Project[]; 
}

