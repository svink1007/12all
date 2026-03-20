import BaseService from "./BaseService";
import { Contacts } from "@capacitor-community/contacts";
import { MOBILE_VIEW } from "../shared/constants";
import { ContactPayload } from "@capacitor-community/contacts/dist/esm/definitions";

export default class ContactService extends BaseService {
  static async verifyContactsFromServer() {
    const deviceContacts: ContactPayload[] = await this.getContactsFromDevice();
    const phoneNumbers: string[] = [];
    deviceContacts.forEach((contact) => {
      contact.phones &&
        contact.phones.forEach(({ number }) => {
          number && phoneNumbers.push(number);
        });
    });
    const {
      data: { commonContacts },
    } = await this.postWithJwtToken<{ commonContacts: string[] }>(
      "/user-contacts",
      { contacts: phoneNumbers }
    );

    const commonContactsList: ContactPayload[] = [];
    commonContacts.forEach((common) => {
      const commonContact = deviceContacts.find(({ phones }) => {
        if (phones) {
          let isCommonContact = false;

          for (let i = 0; i < phones.length; i++) {
            const { number } = phones[i];
            if (number === common) {
              isCommonContact = true;
              break;
            }
          }

          return isCommonContact;
        }
      });

      commonContact && commonContactsList.push(commonContact);
    });

    commonContactsList.sort((a, b) =>
      (a.name?.display || "").localeCompare(b.name?.display || "")
    );

    return commonContactsList;
  }

  private static async getContactsFromDevice() {
    let deviceContacts: ContactPayload[] = [];

    if (MOBILE_VIEW) {
      // const contactPermissions = await Contacts.getPermissions();
      const contactPermissions = await Contacts.checkPermissions();

      if (contactPermissions.contacts === "granted") {
        const { contacts } = await Contacts.getContacts({
          projection: {
            name: true,
            phones: true,
            postalAddresses: true,
          },
        });
        deviceContacts = contacts.filter((contact) => {
          if (contact.phones) {
            return contact.phones.length;
          }
        });
        deviceContacts.forEach((contact) => {
          contact.phones &&
            contact.phones.forEach((phoneNumber) => {
              if (phoneNumber.number) {
                phoneNumber.number = phoneNumber.number.replace(/\D/g, "");
              }
            });
        });
      } else {
        throw new Error("contacts.noPermission");
      }
    }

    return deviceContacts;
  }
}
