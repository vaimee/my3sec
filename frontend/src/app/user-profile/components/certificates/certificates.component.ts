import { Component, OnInit, Input } from '@angular/core';
import { Certificate } from 'app/user-profile/models';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css'],
})
export class CertificatesComponent implements OnInit {
  @Input() certificatesData!: Array<Certificate>;

  ngOnInit(): void {}
}
