/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  skillData: any = [];
  constructor() { }

  ngOnInit(): void {
    this.skillData = [
      {
        skillname: 'Java Script',
        score: 'Computer Score',
        progress: '40',
        pixel: '2345 xp',
        icon: 'verified_user',
      },
      {
        skillname: 'Java Script',
        score: 'Computer Score',
        progress: '50',
        pixel: '345 xp',
        icon: 'verified_user',
      },
      {
        skillname: 'Java Script',
        score: 'Computer Score',
        progress: '55',
        pixel: '885 xp',
        icon: 'verified_user',
      },
      {
        skillname: 'Java Script',
        score: 'Computer Score',
        progress: '65',
        pixel: '2265 xp',
        icon: 'verified_user',
      },
      {
        skillname: 'Java Script',
        score: 'Computer Score',
        progress: '70',
        pixel: '2465 xp',
        icon: 'verified_user',
      },
      {
        skillname: 'Java Script',
        score: 'Computer Score',
        progress: '75',
        pixel: '2867 xp',
        icon: 'verified_user',
      },
    ]
  }

}
