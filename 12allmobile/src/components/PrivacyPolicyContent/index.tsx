import React, { FC } from "react";
import "./styles.scss";
import { IonCardContent, IonRouterLink } from "@ionic/react";

const PrivacyPolicyContent: FC = () => (
  <IonCardContent className="privacy-policy-content">
    <p>
      One Two All OOD is committed to protecting your privacy. By visiting our
      Website/ Application, you accept and agree to the terms and conditions of
      this Privacy Policy. We reserve the right to modify this Privacy Policy at
      any time, so please review it regularly. This Website/ Application
      collects information from users only with their knowledge, active
      permission, and participation.
    </p>
    <p>
      One Two All OOD will maintain the confidentiality of all user information
      and will not give, sell, rent, or loan any identifiable personal
      information to any third party unless we obtain your permission or unless
      we are required to do so by law. We store the minimum information required
      to provide you with support and take necessary precautions to protect this
      data. Information submitted to this site will only be used for the purpose
      for which it is expressly collected. We do not collect or save any credit
      card or other payment information. This information is only collected by
      our payment partners. One Two All OOD may provide non-personal, aggregate
      data or statistics about downloads of the software or our website visitors
      to advertisers or other third parties for marketing and promotional
      purposes but these data or statistics will include no personally
      identifying information. By registering on Website/ Application, you
      automatically accept all the terms of this Privacy Policy. Your only
      remedy, if you do not accept the terms of this Privacy Policy, is to
      discontinue use of the software. If you have questions regarding this
      Privacy Policy or about the security practices of One Two All OOD, please
      contact us by email{" "}
      <IonRouterLink href="mailto:support@12all.tv">
        support@12all.tv
      </IonRouterLink>
      .
    </p>
    <h5>GDPR</h5>
    <p>
      Our system is keeping your email address and Telephone number and type of
      device used only if you subscribe and/or register on the site. Your IP
      address used when opening the application. We use this data only for
      identifying your subscription and supplying you with quality service.
    </p>
    <p>
      We don’t keep any kind of billing info such as credit/debit card numbers
      or Bank account data.
    </p>
    <p>
      At any time, you have the right to request a copy of your personal details
      which we keep, to check the accuracy of the information held. You may ask
      your personal information to be deleted completely. You also have the
      right to complain when your personal data protection rights have been
      violated. You can address all your requests and complaints to{" "}
      <IonRouterLink href="mailto:support@12all.tv">
        support@12all.tv
      </IonRouterLink>
      .
    </p>
  </IonCardContent>
);

export default PrivacyPolicyContent;
