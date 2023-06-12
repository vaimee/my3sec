import { Component, Input } from '@angular/core';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  @Input() projects!: DataTypes.ProjectViewStruct[]; 
}

