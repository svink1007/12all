import React from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonFooter, IonImg, IonList, IonText, IonToolbar} from '@ionic/react';
import footerLogo from '../../images/12all-footer.png';
import {useTranslation} from 'react-i18next';
import {Routes} from '../../shared/routes';

export const versionInfo = {
    version: process.env.REACT_APP_BUILD_VERSION || 'development',
    buildDate: process.env.REACT_APP_BUILD_DATE || 'unknown',
    gitBranch: process.env.REACT_APP_GIT_BRANCH || 'unknown',
    buildTimestamp: Date.now()
};

const Footer: React.FC = () => {
    const {t} = useTranslation();

    const match = versionInfo.version.match(/_(\d+\.\d+\w+)$/);
    const version = match ? match[1] : null;

    // const {uplinkSpeed,streamWidth} = useSelector(({networkData}: ReduxSelectors) => networkData);
    return (
        <IonFooter className="app-footer">
            <IonToolbar>
                <IonList>
                    <IonImg src={footerLogo}/>
                    {/*{uplinkSpeed > 0 && streamWidth > 0 ? */}
                    {/*<div style={{display:'flex', flexDirection:'row'}}>*/}
                    {/*  <div>Uplink Speed - <span style={{color:'red'}}>{uplinkSpeed.toFixed(2)} Mbps </span></div>*/}
                    {/*  <div style={{marginLeft:20}}>Stream Width - <span style={{color:'red'}}>{streamWidth} </span></div>*/}
                    {/*</div>: null}*/}
                    <IonButtons>
                        <IonButton color="medium" routerLink={Routes.PrivacyPolicy}
                                   routerDirection="back">{t('footer.privacy')}</IonButton>
                        <IonButton color="medium" routerLink={Routes.TermsAndConditions}
                                   routerDirection="back">{t('footer.terms')}</IonButton>
                        <IonButton color="medium" routerLink={Routes.ChildSafety}
                                   routerDirection="back">{t('footer.safety')}</IonButton>
                    </IonButtons>
                </IonList>
            </IonToolbar>
            <IonText color="medium" className="copyright">{t('footer.copyright')} {new Date().getFullYear()} { version && `| Version: ${version}` }</IonText>
        </IonFooter>
    );
};

export default Footer;
