import { Component, Input } from '@angular/core';
import { MetamaskService } from 'app/authentication/services/metamask.service';
import { My3secHubContractService } from 'app/shared/services/my3sec-hub-contract.service';
import { Skill } from 'app/user-profile/interfaces';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
})
export class SkillsComponent  {
  @Input() skills!: Array<Skill>;

  constructor(
    private my3secHubContractServiceService: My3secHubContractService,
    private metamaskService: MetamaskService
  ) {}
  
}
