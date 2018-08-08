import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormMetaData } from 'app/shared/interfaces/form-meta-data.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PortCallShipStoresService {

  private shipStoresUrl: string;
  private shipStoresListUrl: string;
  private portCallUrl: string;
  private shipStoresString: string;
  private portCallShipStoresUrl: string; // Ship stores for a given port call
  private measurementTypeUrl: string;

  constructor(private http: HttpClient) {
    this.shipStoresUrl = 'api/falShipStores';
    this.shipStoresListUrl = 'api/falShipStores/list';
    this.portCallUrl = 'api/portCall';
    this.shipStoresString = 'falShipStores';
    this.measurementTypeUrl = 'api/measurementType';
  }

  private shipStoresInformationSource = new BehaviorSubject<any>(null);
  shipStoresList$ = this.shipStoresInformationSource.asObservable();

  private shipStoresInformationMeta = new BehaviorSubject<any>({
    valid: true
  });
  shipStoresInformationMeta$ = this.shipStoresInformationMeta.asObservable();

  private dataIsPristine = new BehaviorSubject<boolean>(true);
  dataIsPristine$ = this.dataIsPristine.asObservable();

  private sequenceNumberSource = new BehaviorSubject<number>(1);
  sequenceNumber$ = this.sequenceNumberSource.asObservable();

  private isCheckedInProgressBar = new BehaviorSubject<boolean>(false);
  isCheckedInProgressBar$ = this.isCheckedInProgressBar.asObservable();

  // API calls
  // Get ship stores object by its primary key ID
  getShipStoresById(shipStoresId: number): Observable<any> {
    const uri = [this.shipStoresUrl, shipStoresId].join('/');
    return this.http.get(uri);
  }
  // Add new ship stores list to database
  addShipStores(shipStoresList: any[]) {
    console.log('Adding ship stores...');
    const uri = this.shipStoresListUrl;
    this.http.post(uri, shipStoresList).map(
      res => {
        if (res) {
          this.setDataIsPristine(true);
        }
      }
    );
  }
  // Update  existing ship stores list in database
  updateShipStores(shipStoresList: any[], portCallId: number) {
    console.log(shipStoresList);
    console.log('Updating ship stores...');
    console.log(shipStoresList);
    const uri = [this.portCallUrl, portCallId, this.shipStoresString].join('/');
    this.setDataIsPristine(true);
    return this.http.put(uri, shipStoresList);
  }
  // Get all ship stores for a given port call
  getShipStoresByPortCallId(portCallId: number): Observable<any> {
    let uri = [this.portCallUrl, portCallId].join('/');
    uri = [uri, this.shipStoresString].join('/');

    return this.http.get(uri);
  }
  // Get list of all measurement types
  getMeasurementTypeList(): Observable<any> {
    const uri = this.measurementTypeUrl;
    return this.http.get(uri);
  }

  /************************
   *
   *  SETTERS AND DELETE
   *
   ************************/

  // Update shipStoresInformationData
  setShipStoresInformationData(data) {
    console.log('Right before data is set in service');
    console.log(data);
    this.shipStoresInformationSource.next(data);
  }

  // Update setShipStoresInformationMeta
  setShipStoresInformationMeta(metaData: FormMetaData) {
    this.shipStoresInformationMeta.next(metaData);
  }

  setDataIsPristine(isPristine: boolean) {
    this.dataIsPristine.next(isPristine);
  }

  setCheckedInProgressBar(checked: boolean) {
    this.isCheckedInProgressBar.next(checked);
  }

  // Delete port call draft
  deleteShipStoreEntry(data) {
    let copyShipStoresInformationSource = this.shipStoresInformationSource.getValue();
    data = JSON.stringify(this.createComparableObject(data));

    // Find clicked item
    copyShipStoresInformationSource.forEach((item, index) => {
      item = JSON.stringify(this.createComparableObject(item));
      if (item === data) {
        copyShipStoresInformationSource.splice(index, 1);
      }
    });

    // Reset all sequenceNumbers
    copyShipStoresInformationSource = this.setSequenceNumbers(copyShipStoresInformationSource);
    this.setShipStoresInformationData(copyShipStoresInformationSource);

    // Set dataIsPristine to false (data is touched)
    this.setDataIsPristine(false);
  }


  /******************
   *
   *  HELP METHODS
   *
   ******************/

  createComparableObject(item) {
    const object = {
      sequenceNumber: item.sequenceNumber,
      articleCode: item.articleCode,
      articleName: item.articleName,
      locationOnBoard: item.locationOnBoard,
      locationOnBoardCode: item.locationOnBoardCode,
      quantity: item.quantity,
    };
    return object;
  }

  setSequenceNumbers(list) {
    let tempSequenceNumber = 1;
    list.forEach(item => {
      item.sequenceNumber = tempSequenceNumber;
      tempSequenceNumber++;
    });
    return list;

  }

}
