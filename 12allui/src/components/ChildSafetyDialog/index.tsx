import React, { FC } from 'react';
import './styles.scss';
import { IonCardContent, IonRouterLink } from '@ionic/react';
import { useTranslation } from 'react-i18next';

const ChildSafetyDialog: FC = () => {
  const { i18n } = useTranslation();

  const renderPageText = () => {
    switch (i18n.language) {
      case 'ar':
        return (
            <>
                <p>
                    يحظر One2All.TV الاعتداء الجنسي على الأطفال والاستغلال الجنسي للأطفال.
                    <br/>
                    <br/>
                    نلتزم التزامًا صارمًا بقوانين ولوائح سلامة الأطفال المعمول بها، بالإضافة إلى معايير
                    معايير الاعتداء الجنسي على الأطفال واستغلالهم جنسيًا (CSAE) و,
                    في حالة الإبلاغ عن مواد الاعتداء الجنسي على الأطفال (CSAM)، نقوم بإبلاغ المركز الوطني
                    للأطفال المفقودين والمستغلين والمركز الوطني للإنترنت الآمن,
                    (<IonRouterLink href="tel:+35929733000">+359 2 973 3000</IonRouterLink>, 411, Bulgaria).
                    <br/>
                    <br/>
                    في حال اكتشافك لأي من الانتهاكات المذكورة أعلاه ضد الأطفال، يرجى إبلاغنا فوراً على
                    &nbsp;<IonRouterLink href="mailto:info@one2all.tv">info@one2all.tv</IonRouterLink> أو أرسل لنا رسالة نصية إلى &nbsp;<IonRouterLink href="tel:+359879141563">+359 879141563</IonRouterLink>
                </p>
            </>
        )
        case 'en':
        default:
            return (
                <>
                    <p>
                        One2All.TV prohibits child sexual abuse and child sexual exploitation.
                        <br/>
                        <br/>
                        We strictly comply with applicable child safety laws and regulations, as well as the Child
                        Sexual
                        Abuse and Sexual Exploitation Standards (CSAE) and,
                        in the event of a report of child sexual abuse material (CSAM), we report it to the National
                        Center
                        for Missing and Exploited Children and the National Safer Internet Center,
                        (<IonRouterLink href="tel:+35929733000">+359 2 973 3000</IonRouterLink>, 411, Bulgaria).
                        <br/>
                        <br/>
                        In case you identify any of the above violations against children, please immediately notify us
                        on:
                        &nbsp;<IonRouterLink href="mailto:info@one2all.tv">info@one2all.tv</IonRouterLink> or text us to &nbsp;<IonRouterLink href="tel:+359879141563">+359 879141563</IonRouterLink>.
              </p>
          </>
        )
    }
  }

  return (
    <IonCardContent className="privacy-policy-content">
      {renderPageText()}
    </IonCardContent>
  )
}

export default ChildSafetyDialog;
