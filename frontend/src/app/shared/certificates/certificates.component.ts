/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {
  certificateData: any = [];
  constructor() { }

  ngOnInit(): void {
    this.certificateData = [
      {
        label: 'video_label',
        cource: 'Computer Scientist',
        achivement: 'Hour based Achivement',
        date: '04/04/2023',
      },
      {
        label: 'video_label',
        cource: 'Computer Scientist',
        achivement: 'Hour based Achivement',
        date: '04/04/2023',
      },
      {
        label: 'video_label',
        cource: 'Computer Scientist',
        achivement: 'Hour based Achivement',
        date: '04/04/2023',
      }
    ];
  }

}
