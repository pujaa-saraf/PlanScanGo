import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-explore-itinerary',
  standalone: true,
  imports: [NgFor, FormsModule, NgIf],
  templateUrl: './explore-itinerary.component.html',
  styleUrl: './explore-itinerary.component.css'
})
export class ExploreItineraryComponent implements OnInit {

  itineraries: { id: number, location: string, no_of_days: number, days: string[][], qr_code: string, qr_url: string, scans: number }[] = [];
  filteredItineraries: { id: number, location: string, no_of_days: number, days: string[][], qr_code: string, qr_url: string, scans: number }[] = [];
  searchTerm: string = '';
  popular_sort: boolean = false;



  ngOnInit() {
    axios.get('http://127.0.0.1:8000/itineraries')
      .then((res) => {
        this.itineraries = res.data.map((itinerary: { id: number, location: string, no_of_days: number, days: string[][], qr_code: string, qr_url: string, scans: number }) => ({ ...itinerary, scans: 0 }));
        this.itineraries.sort((a, b) => b.id - a.id)
        this.filteredItineraries = this.itineraries;

        let config_qr = {
          headers: {
            'Authorization': 'Token '+environment.qrApiKey
          }
        }

        this.filteredItineraries.map((itinerary, _index: number) => {
          axios.get('https://q.api.beaconstac.com/api/2.0/qrcodes/' + itinerary.qr_code +'/', config_qr)
            .then((res) => {
              itinerary.scans = res.data.scans;
            })
            .catch((e) => {
              console.error(e);
            });
            return itinerary;
        });

        // console.log(this.filteredItineraries)
      }).catch((e)=>console.log(e))
  }

  filterItineraries() {
    this.filteredItineraries = this.itineraries.filter((itinerary) => {
      return itinerary.location.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  onClickRecent() {
    this.popular_sort = false;
    this.filteredItineraries.sort((a, b) => b.id - a.id)
  }

  onClickPopular() {
    this.popular_sort = true;
    this.filteredItineraries.sort((a, b) => b.scans - a.scans)
  }

}
