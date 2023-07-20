import { Component, Input } from '@angular/core';

import { Certificate } from '@shared/interfaces';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css'],
})
export class CertificatesComponent {
  @Input() certificates!: Array<Certificate>;
}
