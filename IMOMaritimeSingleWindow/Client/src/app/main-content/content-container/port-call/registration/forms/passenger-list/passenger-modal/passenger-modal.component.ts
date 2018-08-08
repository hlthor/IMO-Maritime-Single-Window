import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { PersonOnBoardModel } from 'app/shared/models/person-on-board-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IdentityDocumentService } from 'app/shared/services/identtity-document.service';
import { IdentityDocumentTypeModel } from 'app/shared/models/identity-document-type-model';
import { GenderModel } from 'app/shared/models/gender-model';
import { PortCallPassengerListService } from 'app/shared/services/port-call-passenger-list.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-passenger-modal',
  templateUrl: './passenger-modal.component.html',
  styleUrls: ['./passenger-modal.component.css']
})
export class PassengerModalComponent implements OnInit {

  inputPassengerModel: PersonOnBoardModel;
  startInputPassengerModel: PersonOnBoardModel;

  passengerModel: PersonOnBoardModel = new PersonOnBoardModel();
  @Output() outputPassengerModel: EventEmitter<PersonOnBoardModel> = new EventEmitter();

  @ViewChild('viewModal') viewModal;
  @ViewChild('editModal') editModal;

  identityDocumentTypes: IdentityDocumentTypeModel[] = [];
  genderList: GenderModel[] = [];

  booleanList: string[] = ['Yes', 'No'];
  booleanModel = {
    'Yes': true,
    'No': false
  };
  formBooleanModel = {
    'true': 'Yes',
    'false': 'No'
  };

  constructor(
    private modalService: NgbModal,
    private identityDocumentService: IdentityDocumentService,
    private passengerService: PortCallPassengerListService
  ) { }

  ngOnInit() {
    this.inputPassengerModel = new PersonOnBoardModel();

    this.identityDocumentService.getIdentityDocumentTypes().subscribe(res => {
      this.identityDocumentTypes = res;
    });

    this.passengerService.getGenderList().subscribe(res => {
      this.genderList = res;
    });
  }

  // Open modals
  openViewModal(passengerModel: PersonOnBoardModel) {
    this.setInputPassengerModel(passengerModel);
    this.modalService.open(this.viewModal);
  }

  openEditModal(passengerModel: PersonOnBoardModel) {
    this.setInputPassengerModel(passengerModel);
    console.log(this.passengerModel);
    this.modalService.open(this.editModal);
  }

  // Output
  editPassenger() {
    console.log(this.inputPassengerModel);
    this.outputPassengerModel.emit(this.inputPassengerModel);
  }

  // Setters
  setInputPassengerModel(passengerModel: PersonOnBoardModel) {
    this.inputPassengerModel = passengerModel;
    this.inputPassengerModel.identityDocument[0] = passengerModel.identityDocument[0];
    this.passengerModel = Object.assign({}, passengerModel);
    this.passengerModel.identityDocument[0] = Object.assign({}, passengerModel.identityDocument[0]);
    console.log(this.passengerModel.identityDocument[0]);
    console.log(typeof this.passengerModel.identityDocument[0].identityDocumentExpiryDate);
  }

  setNationality($event) {
    this.inputPassengerModel.nationality = $event.item;
    this.inputPassengerModel.nationalityId = $event.item.countryId;
  }

  setCountryOfBirth($event) {
    this.inputPassengerModel.countryOfBirth = $event.item;
    this.inputPassengerModel.countryOfBirthId = $event.item.countryId;
  }

  setIssuingNation($event) {
    this.inputPassengerModel.identityDocument[0].issuingNation = $event.item;
    this.inputPassengerModel.identityDocument[0].issuingNationId = $event.item.countryId;
  }

  setIdentityDocumentType($event) {
    if ($event) {
      this.inputPassengerModel.identityDocument[0].identityDocumentType = $event;
      this.inputPassengerModel.identityDocument[0].identityDocumentTypeId = $event.id;
    } else {
      this.resetIdentityDocumentType();
    }
  }

  setPortOfEmbarkation($event) {
    this.inputPassengerModel.portOfEmbarkation = $event;
    this.inputPassengerModel.portOfEmbarkationId = $event.locationId;
  }

  setPortOfDisembarkation($event) {
    this.inputPassengerModel.portOfDisembarkation = $event;
    this.inputPassengerModel.portOfDisembarkationId = $event.locationId;
  }

  setDateOfBirth($event) {
    if ($event) {
      this.inputPassengerModel.dateOfBirth = this.getDateFormat($event);
    } else {
      this.resetDateOfBirth();
    }
  }

  setIdentityDocumentIssueDate($event) {
    if ($event) {
      this.inputPassengerModel.identityDocument[0].identityDocumentIssueDate = this.getDateFormat($event);
    } else {
      this.inputPassengerModel.identityDocument[0].identityDocumentIssueDate = null;
    }
  }

  setIdentityDocumentExpiryDate($event) {
    console.log($event);
    if ($event) {
      this.inputPassengerModel.identityDocument[0].identityDocumentExpiryDate = this.getDateFormat($event);
      console.log(this.inputPassengerModel.identityDocument[0].identityDocumentExpiryDate);
    } else {
      this.inputPassengerModel.identityDocument[0].identityDocumentExpiryDate = null;
    }
  }

  setTransit($event) {
    console.log($event);
    this.inputPassengerModel.inTransit = this.booleanModel[$event];
    console.log(this.booleanModel[$event]);
  }

  setGender($event) {
    console.log($event);
    if ($event) {
      this.inputPassengerModel.gender = $event;
      this.inputPassengerModel.genderId = $event.genderId;
    } else {
      this.inputPassengerModel.gender = null;
      this.inputPassengerModel.genderId = null;
    }
  }

  // Resetters
  resetInputPassengerModel($event: any) {
    this.inputPassengerModel = Object.assign(this.inputPassengerModel, this.passengerModel);
    this.inputPassengerModel.identityDocument[0] = Object.assign(this.inputPassengerModel.identityDocument[0], this.passengerModel.identityDocument[0]);
  }

  resetNationality() {
    this.inputPassengerModel.nationality = null;
    this.inputPassengerModel.nationalityId = null;
  }

  resetCountryOfBirth() {
    this.inputPassengerModel.countryOfBirth = null;
    this.inputPassengerModel.countryOfBirthId = null;
  }

  resetIssuingNation() {
    this.inputPassengerModel.identityDocument[0].issuingNation = null;
    this.inputPassengerModel.identityDocument[0].issuingNationId = null;
  }

  resetIdentityDocumentType() {
    this.inputPassengerModel.identityDocument[0].identityDocumentType = null;
    this.inputPassengerModel.identityDocument[0].identityDocumentTypeId = null;
  }

  resetPortOfEmbarkation() {
    this.inputPassengerModel.portOfEmbarkation = null;
    this.inputPassengerModel.portOfEmbarkationId = null;
  }

  resetPortOfDisembarkation() {
    this.inputPassengerModel.portOfDisembarkation = null;
    this.inputPassengerModel.portOfDisembarkationId = null;
  }

  resetDateOfBirth() {
    this.inputPassengerModel.dateOfBirth = null;
  }


  // Helper methods
  getNgbDateFormat(date) {
    const newDate = new Date(date);
    return {
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1,
      day: newDate.getDate()
    };
  }

  getDateFormat(date) {
    if (date.year && date.month && date.day) {
      const dateString = date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + date.day).slice(-2) + 'T00:00:00';
      return dateString;
    } else {
      return null;
    }
  }

  getDisplayDateFormat(date) {
    return date.split('T')[0];
  }
}
