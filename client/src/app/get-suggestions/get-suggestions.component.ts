import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Injectable, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { NgxLoadingModule, NgxLoadingService } from 'ngx-loading';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

type Role = 'user' | 'system' | 'assistant';

type Message = {
  content: string;
  role: Role;
};

@Injectable({ providedIn: 'root' })
export class OpenAIService {
  public async doOpenAICall(
    messages: Message[],
    temperature: number,
    model: string
  ): Promise<Observable<string>> {
    const url = 'https://api.openai.com/v1/chat/completions';


    return new Observable((observer) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer '+environment.openAiApiKey);

      xhr.onprogress = () => {
        const newUpdates = xhr.responseText
          .replace('data: [DONE]', '')
          .trim()
          .split('data: ')
          .filter(Boolean);

        const newUpdatesParsed: string[] = newUpdates.map((update) => {
          const parsed = JSON.parse(update);
          return parsed.choices[0].delta?.content || '';
        });
        observer.next(newUpdatesParsed.join(''));
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            observer.complete();
          } else {
            observer.error(
              new Error('Request failed with status ' + xhr.status)
            );
          }
        }
      };

      xhr.send(
        JSON.stringify({
          model,
          messages,
          temperature,
          frequency_penalty: 0,
          presence_penalty: 0,
          stream: true,
        })
      );

      return () => {
        xhr.abort();
      };
    });
  }
}

@Component({
  selector: 'app-get-suggestions',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgIf, NgxLoadingModule],
  providers: [OpenAIService],
  templateUrl: './get-suggestions.component.html',
  styleUrl: './get-suggestions.component.css'
})
export class GetSuggestionsComponent {

  cookieValue: string | null = null;

  constructor(private cdr: ChangeDetectorRef, private ngxLoadingService: NgxLoadingService, private cookieService: CookieService, private router: Router) { 
    this.cookieValue = this.cookieService.get('Token');
  }

  private readonly openAiService = inject(OpenAIService);
  public openAiResult$ = of('');
  loading: boolean = false;

  location: string = '';
  days: number = 0;
  style: string = '';
  result: string = '';
  daysArray: string[][] = [];

  public async doOpenAICall() {
    const messages: Message[] = [
      {
        "role": "system",
        "content": "As a trip planner, create a JSON itinerary based on the provided details: location, duration (in days), and travel style. \n\nElaborate on each activity, share insights, historical context, and any noteworthy details that make the activity special. Do not mention the time of the day.\n\nJSON Format:\n[\n  \"1\": [\"Activity Description\", \"Activity Description\", ...],\n  \"2\": [\"Activity Description\", \"Activity Description\", ...],\n  ...\n}"
      },
      {
        "role": "user",
        "content": "location: " + this.location + "\nduration: " + this.days.toString() + "\nstyle: " + this.style
      },
    ];

    this.loading = true;

    try {
      const responseObservable = await this.openAiService.doOpenAICall(
        messages,
        0.5,
        'gpt-3.5-turbo'
      );

      responseObservable.subscribe({
        next: (result) => {
          this.result = result;
        },
        complete: () => {
          console.log('Operation completed');
          this.daysArray = Object.values(JSON.parse(this.result.trim()));
          console.log(this.daysArray);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error occurred:', error);
        }
      });
    } catch (error) {
      console.error('Error occurred:', error);
      this.loading = false;
    }

  }


  onSave() {
    if(!this.cookieValue){
      this.router.navigateByUrl('/login');
      return;
    }
    
    this.loading = true;

    let config = {
      headers: {
        'Authorization': 'Token ' + this.cookieValue
      }
    }

    let config_qr = {
      headers: {
        'Authorization': 'Token '+environment.qrApiKey
      }
    }

    let itinerary_id = null;
    let qr_id = null;
    let qr_url = "#";

    axios.post('http://127.0.0.1:8000/create_itinerary', {
      location: this.location,
      no_of_days: this.days,
      days: this.daysArray,
      qr_code: "#",
      qr_url: "#"
    }, config).then((res) => {
      // console.log(res.data);
      itinerary_id = res.data.id;

      const body = {
        "name": "Custom URL",
        "organization": environment.qrOrg,
        "qr_type": 2,
        "campaign": {
          "content_type": 1,
          "custom_url": "http://localhost:4200/itinerary/" + itinerary_id!.toString()
        },
        "location_enabled": false,
        "attributes": {
          "color": "#8C7D6B",
          "colorDark": "#8C7D6B",
          "margin": 80,
          "isVCard": false,
          "dataPattern": "square",
          "eyeBallShape": "circle",
          "gradientType": "none",
          "eyeFrameColor": "#8C7D6B",
          "eyeFrameShape": "rounded"
        }
      }

      return axios.post('https://q.api.beaconstac.com/api/2.0/qrcodes/', body, config_qr);
    }).then((res) => {
      // console.log(res.data);
      qr_id = res.data.id;
      return axios.get('https://q.api.beaconstac.com/api/2.0/qrcodes/' + qr_id + '/download/?size=1024&error_correction_level=5&canvas_type=png', config_qr)

    })
      .then((res) => {
        // console.log(res.data);
        qr_url = res.data.urls.png;

        return axios.put('http://127.0.0.1:8000/edit_itinerary/' + itinerary_id!.toString(), {
          location: this.location,
          no_of_days: this.days,
          days: this.daysArray,
          qr_code: qr_id!.toString(),
          qr_url: qr_url
        }, config);

      })
      .then((res) => {
        // console.log(res.data);
        this.loading = false;
        this.router.navigateByUrl('/my-itineraries')
      }).catch((e) => console.log(e));
  }
}
