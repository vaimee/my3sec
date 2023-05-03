/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-skill',
  templateUrl: './skill.component.html',
  styleUrls: ['./skill.component.css']
})
export class SkillComponent implements OnInit {
  skillData: any = [];

  ngOnInit(): void {
    this.skillData = [
      {
        skill: "Javascript",
        scrore: "Computer Score",
        progress: "40",
        subtitle: "Computer Score",
        icon: "verified_user",
      },
      {
        skill: "Javascript",
        scrore: "Computer Score",
        progress: "40",
        subtitle: "Computer Score",
        icon: "verified_user",
      },
      {
        skill: "Javascript",
        scrore: "Computer Score",
        progress: "40",
        subtitle: "Computer Score",
        icon: "verified_user",
      },
      {
        skill: "Javascript",
        scrore: "Computer Score",
        progress: "40",
        subtitle: "Computer Score",
        icon: "verified_user",
      },
      {
        skill: "Javascript",
        scrore: "Computer Score",
        progress: "40",
        subtitle: "Computer Score",
        icon: "verified_user",
      },
      {
        skill: "Javascript",
        scrore: "Computer Score",
        progress: "40",
        subtitle: "Computer Score",
        icon: "verified_user",
      },
    ];
  }

}
