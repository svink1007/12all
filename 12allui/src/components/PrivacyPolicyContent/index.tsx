import React, { FC } from 'react';
import './styles.scss';
import { IonCardContent, IonRouterLink } from '@ionic/react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicyContent: FC = () => {
  const { i18n } = useTranslation();

  const renderPageText = () => {
    switch (i18n.language) {
      case 'ar':
        return (
          <>
            <p>
              يلتزم One Two All OOD تلفزيون[١,٢ الشامل ] بحماية خصوصيتك. من خلال زيارتك موقعنا و تطبيقنا ، فإنك تقبل وتوافق على شروط وأحكام سياسة الخصوصية هذه. ونحتفظ بالحق في تعديل سياسة الخصوصية هذه في أي وقت ، لذا يرجى مراجعتها بانتظام. يجمع هذا الموقع و التطبيق المعلومات من المستخدمين فقط و بمعرفتهم ، وإذنهم النشط ، ومشاركتهم
            </p>
            <p>
              سيحافظ One Two All OOD تلفزيون[١,٢ الشامل ]على سرية جميع المعلومات المستخدمة ولن تمنح أو تبيع أو تؤجر أو تقرض أي معلومات شخصية يمكن تحديدها لأي طرف ثالث ما لم نحصل على إذن منكم مسبقا أو ما لم يُطلب منا القيام بذلك بموجب القانون. نحن نقوم بتخزين الحد الأدنى من المعلومات المطلوبة لتزويدك بالدعم واتخاذ الاحتياطات اللازمة لحماية هذه البيانات و سيتم استخدام المعلومات المقدمة إلى هذا الموقع فقط للغرض الذي تم جمعها صراحةً من أجله
              نحن لا نجمع أو نحتفظ بأي بطاقة ائتمان أو معلومات دفع أخرى. يتم جمع هذه المعلومات فقط من قبل شركاء الدفع لدينا. قد توفر تلفزيون[١,٢ الشامل ]One Two All OOD بيانات أو إحصاءات مجمعة غير شخصية حول تنزيلات البرنامج أو زوار موقعنا الإلكتروني وللمعلنين أو لأطراف ثالثة لأغراض تسويقية وترويجية ، لكن هذه البيانات أو الإحصاءات لن تتضمن أي معلومات تعريف شخصية. بالتسجيل في موقع الويب / التطبيق ، فإنك تقبل تلقائيًا جميع شروط سياسة الخصوصية هذه. الحل الوحيد لك ، إذا كنت لا تقبل شروط سياسة الخصوصية هذه ، هو التوقف عن استخدام البرنامج

              إذا كانت لديك أسئلة بخصوص سياسة الخصوصية هذه أو حول ممارسات الأمان الخاصة بـ One   فيرجى الاتصال بنا عبر البريد الإلكتروني
              support@12all.tv.Two All OODلتلفزيون[١,٢ الشامل ]  ،
              <IonRouterLink href="mailto:support@12all.tv">support@12all.tv</IonRouterLink>.
            </p>
            <p>
              يحتفظ نظامنا بعنوان بريدك الإلكتروني ورقم هاتفك ونوع الجهاز المستخدم فقط في حالة الاشتراك و / أو التسجيل على الموقع. عنوان الIP الخاص بك المستخدم عند فتح التطبيق. نحن نستخدم هذه البيانات فقط لتحديد اشتراكك وتزويدك بخدمة عالية الجودة
              لا نحتفظ بأي نوع من المعلومات الخاصة مثل أرقام بطاقات الائتمان والخصم أو بيانات الحساب المصرفي
              يحق لك في أي وقت طلب نسخة من بياناتك الشخصية التي نحتفظ بها للتحقق من دقة المعلومات المحفوظة. قد تطلب حذف معلوماتك الشخصية بالكامل.  و أيضًا لديك الحق في تقديم شكوى عند انتهاك حقوق حماية بياناتك الشخصية الخاصة بك. يمكنك تقديم كل  طلباتك وشكاويك على

              <IonRouterLink href="mailto:support@12all.tv">support@12all.tv</IonRouterLink>.
            </p>
          </>
        )
      case 'en':
      default:
        return (
          <>
            <p>
              One Two All OOD is committed to protecting your privacy. By visiting our Website/ Application, you accept
              and
              agree to the terms and conditions of this Privacy Policy. We reserve the right to modify this Privacy
              Policy
              at any time, so please review it regularly. This Website/ Application collects information from users only
              with their knowledge, active permission, and participation.
            </p>
            <p>
              One Two All OOD will maintain the confidentiality of all user information and will not give, sell, rent,
              or
              loan any identifiable personal information to any third party unless we obtain your permission or unless
              we
              are required to do so by law. We store the minimum information required to provide you with support and
              take
              necessary precautions to protect this data. Information submitted to this site will only be used for the
              purpose for which it is expressly collected. We do not collect or save any credit card or other payment
              information. This information is only collected by our payment partners. One Two All OOD may provide
              non-personal, aggregate data or statistics about downloads of the software or our website visitors to
              advertisers or other third parties for marketing and promotional purposes but these data or statistics
              will
              include no personally identifying information. By registering on Website/ Application, you automatically
              accept all the terms of this Privacy Policy. Your only remedy, if you do not accept the terms of this
              Privacy
              Policy, is to discontinue use of the software. If you have questions regarding this Privacy Policy or
              about
              the security practices of One Two All OOD, please contact us by email <IonRouterLink
                href="mailto:support@12all.tv">support@12all.tv</IonRouterLink>.
            </p>
            <h5>GDPR</h5>
            <p>
              Our system is keeping your email address and Telephone number and type of device used only if you
              subscribe
              and/or register on the site. Your IP address used when opening the application. We use this data only for
              identifying your subscription and supplying you with quality service.
            </p>
            <p>
              We don’t keep any kind of billing info such as credit/debit card numbers or Bank account data.
            </p>
            <p>
              At any time, you have the right to request a copy of your personal details which we keep, to check the
              accuracy of the information held. You may ask your personal information to be deleted completely. You also
              have the right to complain when your personal data protection rights have been violated.
              You can address all your requests and complaints to <IonRouterLink
                href="mailto:support@12all.tv">support@12all.tv</IonRouterLink>.
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

export default PrivacyPolicyContent;
