import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AngularToastifyModule } from 'angular-toastify'; 
import { NavbarComponent } from './navbar/navbar.component';
import {CookieService} from 'ngx-cookie-service'
import axios from 'axios';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent, AngularToastifyModule],
  providers: [CookieService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'my-project';
  cookieValue: string|null = null;

  constructor(private cookieService: CookieService, private userService: UserService) {
    
  }

  ngOnInit() {
    this.cookieValue = this.cookieService.get('Token');

    let config = {
      headers: {
        'Authorization': 'Token ' + this.cookieValue
      }
    }
    if(this.cookieValue){
      axios.get('http://127.0.0.1:8000/get_user', config).then((res)=>{
        this.userService.setUser(res.data);
      }).catch((e)=>{
        console.log(e);
      })
    }
  }


}
