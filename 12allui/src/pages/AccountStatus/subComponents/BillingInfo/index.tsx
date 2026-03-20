import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import { IonButton, IonCardContent, IonLabel, IonRadio, IonRadioGroup } from "@ionic/react";
import { useTranslation } from "react-i18next";
import InputWithLabel from "../../../../components/InputComponent/PlainInput";
import TextAreaIonInput from "../../../../components/InputComponent/TextAreaInput";
import { BillingServices } from "../../../../services";
import { BillingInfo } from "../../../../shared/types";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../../../redux/shared/types";

const BillingInfoComponent: FC = () => {
  const { t } = useTranslation()

  const { id, email, phoneNumber, firstName, lastName, countryOfResidence } = useSelector(({ profile }: ReduxSelectors) => profile);
  const [selectedType, setSelectedType] = useState<string>("");
  const [firstNameField, setFirstNameField] = useState<string>(firstName ? firstName : "");
  const [lastNameField, setLastNameField] = useState<string>(lastName ? lastName : "");
  const [emailField, setEmailField] = useState<string>(email ? email : "");
  const [phoneNumberField, setPhoneNumberField] = useState<string>(phoneNumber ? phoneNumber : "");
  const [country, setCountry] = useState<string>(countryOfResidence ? countryOfResidence : "");
  const [vatNumber, setVatNumber] = useState<string>("");
  const [address1, setAddress1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [postCode, setPostCode] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [isUpdate, setIsUpdate] = useState<boolean>(false)

  const radioOptions = [
    { value: 'PERSONAL', label: 'Personal' },
    { value: 'CORPORATE', label: 'Corporate' },
  ];

  useEffect(() => {
    BillingServices.getBillingInfo(id).then(({ data: { result, status } }) => {
      console.log("result get billing", result, status)
      if (status === 'ok' && result) {
        setSelectedType(result.type);
        setFirstNameField(result.firstName);
        setLastNameField(result.lastName);
        setEmailField(result?.email);
        setPhoneNumberField(result?.phoneNumber);
        setCountry(result.country);
        setVatNumber(result.vatNumber);
        setAddress1(result.address1);
        setAddress2(result.address2);
        setPostCode(result.postCode);
        setCity(result.city);
        setIsUpdate(true)
      } else {
        setIsUpdate(false)
      }
    })
  }, [id])

  const handleSubmit = () => {
    const billingInfo: BillingInfo = {
      userId: id,
      type: selectedType || "",
      firstName: firstName ? firstName : firstNameField,
      lastName: lastName ? lastName : lastNameField,
      email: email ? email : emailField,
      phoneNumber: phoneNumber ? phoneNumber : phoneNumberField,
      country: countryOfResidence ? countryOfResidence : country,
      vatNumber: vatNumber || "",
      address1: address1 || "",
      address2: address2 || "",
      postCode: postCode || "",
      city: city || ""
    }

    if (isUpdate) {
      BillingServices.updateBillingInfo(billingInfo).then(() => {})
    }
    else {
      BillingServices.addBillingInfo(billingInfo).then((result) => {
        console.log("result add billing info", result)
        if (result.data.status === 'ok' && result.status === 200) {
          console.log("inside add result")
          setIsUpdate(true);
        }
      })
    }
  }

  return (
    <div className="billing-info-status">

      <IonRadioGroup
        value={selectedType}
        onIonChange={(e) => setSelectedType(e.detail.value)}
      >
        {radioOptions.map((option) => (
          <div className="radio-button" key={option.value}>
            <IonRadio slot="end" value={option.value} />
            <IonLabel>{option.label}</IonLabel>
          </div>
        ))}
      </IonRadioGroup>

      <IonCardContent>
        <form>
          <div className="form-inputs-row">
            <div className="form-inputs-col-1">
              <InputWithLabel
                label={t('billing.accountStatus.menu1.firstName')}
                type="text"
                name={firstNameField}
                value={firstNameField}
                setValue={setFirstNameField}
              />

              <InputWithLabel
                label={t('billing.accountStatus.menu1.lastName')}
                type="text"
                name={lastNameField}
                value={lastNameField}
                setValue={setLastNameField}
              />

              <InputWithLabel
                label={t('billing.accountStatus.menu1.email')}
                type="text"
                name={emailField}
                value={emailField}
                setValue={setEmailField}
                disabled={email ? true : false}
              />

              <InputWithLabel
                label={t('billing.accountStatus.menu1.phoneNumber')}
                type="number"
                name={phoneNumberField}
                value={phoneNumberField}
                setValue={setPhoneNumberField}
                disabled={phoneNumber ? true : false}
              />

              <InputWithLabel
                label={t('billing.accountStatus.menu1.country')}
                type="text"
                name={country}
                value={country}
                setValue={setCountry}
              />

              <InputWithLabel
                label={t('billing.accountStatus.menu1.vatNumber')}
                type="text"
                name={vatNumber}
                value={vatNumber}
                setValue={setVatNumber}
              />
            </div>

            <div className="form-inputs-col-2">
              <TextAreaIonInput
                label={t('billing.accountStatus.menu1.address1')}
                name={address1}
                value={address1}
                setValue={setAddress1}
              />

              <TextAreaIonInput
                label={t('billing.accountStatus.menu1.address2')}
                name={address2}
                value={address2}
                setValue={setAddress2}
              />

              <InputWithLabel
                label={t('billing.accountStatus.menu1.postalCode')}
                type="text"
                name={postCode}
                value={postCode}
                setValue={setPostCode}
              />

              <InputWithLabel
                label={t('billing.accountStatus.menu1.city')}
                type="text"
                name={city}
                value={city}
                setValue={setCity}
              />
            </div>
          </div>
          <div className="save-button">
            <IonButton onClick={() => handleSubmit()}>
              {t('billing.accountStatus.menu2.save')}
            </IonButton>
          </div>
        </form>
      </IonCardContent>
    </div>

  )
}

export default BillingInfoComponent

