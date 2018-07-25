import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocationTimeProperties } from 'app/shared/constants/location-time-properties';
import { PortCallService } from 'app/shared/services/port-call.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-location-time-info-table',
  templateUrl: './location-time-info-table.component.html',
  styleUrls: ['./location-time-info-table.component.css']
})
export class LocationTimeInfoTableComponent implements OnInit, OnDestroy {
  locationFlag: string;
  locationTimeProperties = LocationTimeProperties.PROPERTIES;
  locationTimeInfo: any[] = [];

  locationDataSubscription: Subscription;

  constructor(private portCallService: PortCallService) {}

  ngOnInit() {
    this.locationTimeProperties = LocationTimeProperties.PROPERTIES;
    this.locationDataSubscription = this.portCallService.locationData$.subscribe(locationResult => {
      if (locationResult) {
        this.locationFlag = locationResult.country
          ? locationResult.country.twoCharCode.toLowerCase()
          : null;
        this.locationTimeProperties.LOCATION_TYPE.data =
          locationResult.locationType.name;
        this.locationTimeProperties.LOCATION_NAME.data = locationResult.name;
        this.locationTimeProperties.LOCATION_CODE.data =
          locationResult.locationCode;

        this.portCallService.etaEtdData$.subscribe(dateTimeResult => {
          if (dateTimeResult && dateTimeResult.eta && dateTimeResult.etd) {
            this.locationTimeProperties.ETA.data = this.dateTimeFormat(
              dateTimeResult.eta
            );
            this.locationTimeProperties.ETD.data = this.dateTimeFormat(
              dateTimeResult.etd
            );
          }
        });
      }
      this.locationTimeInfo = Object.values(this.locationTimeProperties);
    });
  }

  ngOnDestroy() {
    this.locationDataSubscription.unsubscribe();
  }

  private dateTimeFormat(time) {
    return (
      time.year +
      '-' +
      this.twoDigitFormat(time.month) +
      '-' +
      this.twoDigitFormat(time.day) +
      ' ' +
      this.twoDigitFormat(time.hour) +
      ':' +
      this.twoDigitFormat(time.minute)
    );
  }

  private twoDigitFormat(number: number) {
    if (number <= 9) {
      return '0' + number;
    } else {
      return number;
    }
  }
}
