/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {
  certificatesData: any = [];

  ngOnInit(): void {
    this.certificatesData = [
      {
        icon: "video_label",
        name: "Computer Scientist",
        achivement: "Hour based Achivement",
        date: "04/04/2023"
      },
      {
        icon: "video_label",
        name: "Computer Scientist",
        achivement: "Hour based Achivement",
        date: "04/04/2023"
      },
      {
        icon: "video_label",
        name: "Computer Scientist",
        achivement: "Hour based Achivement",
        date: "04/04/2023"
      },

    ];
  }

}
