import { Observable } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';

import { SkillService } from '@shared/services/skill.service';

import { ProfileSkill } from '@profiles/interfaces';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
})
export class SkillsComponent implements OnInit {
  @Input() profileId!: number;
  skills$!: Observable<ProfileSkill[]>;

  constructor(private skillsService: SkillService) {}
  ngOnInit(): void {
    this.skills$ = this.skillsService.getProfileSkills(this.profileId);
    this.skillsService.getSkills().subscribe(skills => {
      for (const skill of skills) {
        console.log(skill);
      }
    });
  }
}
