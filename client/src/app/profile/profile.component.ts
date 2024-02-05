import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgFor, CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  cookieValue: string | null = null;

  itineraries: { id: number, location: string, no_of_days: number, days: string[][], qr_code: string, qr_url:string }[] = [];

  constructor(private cookieService: CookieService){}

  ngOnInit() {
    this.cookieValue = this.cookieService.get('Token');
    let config = {
      headers: {
        'Authorization': 'Token ' + this.cookieValue
      }
    }

    axios.get('http://127.0.0.1:8000/my_itineraries', config)
      .then((res) => {
        this.itineraries = res.data;
        this.itineraries.sort((a,b)=>b.id-a.id);
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
