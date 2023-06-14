import { Component, Input } from '@angular/core';

import { MetamaskService } from './../../../../auth/services/metamask.service';
import { Skill } from './../../../../modules/profiles/interfaces';
import { My3secHubContractService } from './../../../../shared/services/my3sec-hub-contract.service';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
})
export class SkillsComponent {
  @Input() skills!: Array<Skill>;

  constructor(
    private my3secHubContractServiceService: My3secHubContractService,
    private metamaskService: MetamaskService
  ) {}
}
