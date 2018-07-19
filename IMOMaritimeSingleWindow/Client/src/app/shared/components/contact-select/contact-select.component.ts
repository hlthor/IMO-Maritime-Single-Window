import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactModel } from 'app/shared/models/contact-model';
import { ConstantsService } from 'app/shared/services/constants.service';
import { ContactService } from 'app/shared/services/contact.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-contact-select',
  templateUrl: './contact-select.component.html',
  styleUrls: ['./contact-select.component.css'],
  providers: [ConstantsService]
})
export class ContactSelectComponent implements OnInit, OnDestroy {
  contactList: ContactModel[];
  selectedContactModels: ContactModel[];

  getContactMediumListSubscription: Subscription;

  constructor(
    private constantsService: ConstantsService,
    private contactService: ContactService
  ) {}

  ngOnInit() {
    this.getContactMediumListSubscription = this.constantsService.getContactMediumList().subscribe(data => {
      if (data) {
        this.contactList = data.map(d => {
          const contactModel = new ContactModel();
          contactModel.contactMedium = d;
          return contactModel;
        });
      }
    });
  }

  ngOnDestroy() {
    this.getContactMediumListSubscription.unsubscribe();
  }

  preferredSet(selectedContactModel: ContactModel) {
    const newUpdatedContactMediums = this.selectedContactModels.map(
      oldContactModel => {
        if (
          oldContactModel.contactMedium.contactMediumId ===
          selectedContactModel.contactMedium.contactMediumId
        ) {
          return selectedContactModel;
        }
        const updatedContactModel = oldContactModel;
        updatedContactModel.isPreferred = false;
        return updatedContactModel;
      }
    );
  }

  contactMediumSelected() {
    this.contactService.setContactData(this.selectedContactModels);
  }

  contactInfoChanged(contactMedium: ContactModel) {
    this.contactService.setContactData(this.selectedContactModels);
  }
}
