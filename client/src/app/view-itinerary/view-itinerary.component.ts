import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-view-itinerary',
  standalone: true,
  imports: [NgFor],
  templateUrl: './view-itinerary.component.html',
  styleUrl: './view-itinerary.component.css'
})
export class ViewItineraryComponent implements OnInit {
  itineraryId: string | null = null;
  itinerary: { id: number, location: string, no_of_days: number, days: string[][], qr_code: string, qr_url: string } | null = null;

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.itineraryId = params.get('id');
    });

    axios.get('http://127.0.0.1:8000/itinerary/' + this.itineraryId).then((res) => {
        this.itinerary=res.data
      }).catch((e) => {
        console.log(e);
      });
  }
}
