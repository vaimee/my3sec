import { Observable } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';

import { ProfileSkill } from '@profiles/interfaces';
import { ProfileService } from '@shared/services/profile.service';
import { SkillService } from '@shared/services/skill.service';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
})
export class SkillsComponent implements OnInit {
  @Input() profileId!: number;
  skills$!: Observable<ProfileSkill[]>;

  constructor(private profileService: ProfileService, private skillsService: SkillService) {}
  ngOnInit(): void {
    this.skills$ = this.profileService.getSkills(this.profileId);
    this.skillsService.getAllSkills().subscribe(skills => {
      console.log('here');
      for(let skill of skills) {
        console.log(skill);
      }
    })
  }
}
