import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs';
import { Http, RequestOptions } from '@angular/http';
import { PortCallModel } from '../models/port-call-model';

@Injectable()
export class PortCallOverviewService {
    constructor(private http: Http) {
        this.getOverviewUrl = 'api/portcall/overview';
        this.getPortCallsByLocationUrl = 'api/portcall/location';
    }
    private getOverviewUrl:string;
    private getPortCallsByLocationUrl:string;
    
    // private overviewDataSource = new BehaviorSubject<any>(null);
    // overviewData$ = this.overviewDataSource.asObservable();

    private portCallDataSource = new BehaviorSubject<any>(null);
    portCallData$ = this.portCallDataSource.asObservable();
    
    getOverview(portCallId: number) {
        let uri:string = [this.getOverviewUrl, portCallId].join('/');
        return this.http.get(uri)
                .map(res => res.json());
    }

    setPortCallData(data) {
        this.portCallDataSource.next(data);
    }

    getPortCallsByLocation(locationId: number) {
        let uri:string = [this.getPortCallsByLocationUrl, locationId].join('/');
        return this.http.get(uri)
                .map(res => res.json());
    }
}