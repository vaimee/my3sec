import { Component, OnInit } from '@angular/core';
import { Skill } from 'app/user-profile/models';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
})
export class SkillsComponent implements OnInit {
  skillData: Array<Skill> = [];

  ngOnInit(): void {
    this.skillData = [
      {
        skillName: 'Javascript',
        progress: 40,
        category: 'Computer Score',
        icon: 'verified_user',
      },
      {
        skillName: 'Javascript',
        progress: 50,
        category: 'Computer Score',
        icon: 'verified_user',
      },
      {
        skillName: 'Javascript',
        progress: 40,
        category: 'Computer Score',
        icon: 'verified_user',
      },
      {
        skillName: 'Javascript',
        progress: 40,
        category: 'Computer Score',
        icon: 'verified_user',
      },
      {
        skillName: 'Javascript',
        progress: 40,
        category: 'Computer Score',
        icon: 'verified_user',
      },
      {
        skillName: 'Javascript',
        progress: 40,
        category: 'Computer Score',
        icon: 'verified_user',
      },
    ];
  }
}
