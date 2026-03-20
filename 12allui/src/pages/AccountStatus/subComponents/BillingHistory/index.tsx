import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import { IonCol, IonGrid, IonLabel, IonRow, IonSpinner } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { TransactionStarsTable } from "../../../../shared/types";
import { ReduxSelectors } from "../../../../redux/shared/types";
import { useDispatch, useSelector } from "react-redux";
import { BillingServices } from "../../../../services";
import { updateStarsBalance } from "../../../../shared/helpers";
import { setTotalStarBalance } from "../../../../redux/actions/billingRewardActions";


const BillingHistory: FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  // const menuItems = ["menu1", "menu2", "menu3", "menu4", "menu5", "menu6"];
  const { id, jwt, isAnonymous } = useSelector(({ profile }: ReduxSelectors) => profile)
  const [starsTable, setStarsTable] = useState<TransactionStarsTable[]>()

  useEffect(() => {
    const page = 1
    const pageSize = 100
    if (jwt && !isAnonymous) {
      BillingServices.billingStarsStatusTable(id, page, pageSize).then(async ({ data: { result } }) => {
        if (result) {
          // calculateTotalStars(result.transactions)
          const starsBalance = await updateStarsBalance(id)
          dispatch(setTotalStarBalance(starsBalance))
          setStarsTable(result.transactions)
        }
      })
    }
  }, [id, jwt, isAnonymous, dispatch])

  return (
    <div className="billing-history-status">
      <IonGrid fixed={true} className="table-grid">
        {/* <IonRow >
            <IonHeader className="table-header">
              <IonTitle>{t('billing.starsStatus.starsTransaction')}</IonTitle>
            </IonHeader>
          </IonRow> */}

        <IonRow className="stars-status-table">
          <IonCol size="auto" className="star-col-1" >{t('billing.starsStatus.date')}</IonCol>
          <IonCol size="auto" className="star-col-2" >{t('billing.starsStatus.type')}</IonCol>
          <IonCol size="auto" className="star-col-3" >{t('billing.starsStatus.stars')}</IonCol>
          <IonCol size="auto" className="star-col-4" >{t('billing.starsStatus.value')}</IonCol>
          <IonCol size="auto" className="star-col-5" >{t('billing.starsStatus.cost')}</IonCol>
          {/* <IonImg src={starIconWhite} /> */}
          {/* <IonLabel>{t('billing.starsStatus.cost')}</IonLabel> */}
          {/* </IonCol> */}
        </IonRow>
        <hr className="horizontal-row" />

        {
          starsTable ? starsTable?.map((item, index) => {
            const splittedStars = item.amount.toString().match(/^([+-]?)(\d+)$/)?.slice(1)
            const splittedDate = item.date.substring(0, 10)

            return (
              <div key={index}>
                <IonRow className="stars-status-table">
                  <IonCol size="auto" className="star-col-1" >{splittedDate}</IonCol>
                  <IonCol size="auto" className="star-col-2" >{item.type}</IonCol>
                  <IonCol size="auto" className="star-col-3" >
                    <IonLabel style={{ marginRight: 10 }}>{`${splittedStars?.[0] === "" ? "+" : splittedStars?.[0]}${splittedStars?.[1]}`}</IonLabel>
                  </IonCol>
                  <IonCol size="auto" className="star-col-4" >{"val"}</IonCol>
                  <IonCol size="auto" className="star-col-5" >{"cost"}</IonCol>
                </IonRow>
                <hr className="horizontal-row" />
              </div>
            )
          })
            :
            <IonRow className="stars-table-spinner">
              <IonSpinner />
            </IonRow>
        }
      </IonGrid>
    </div>
  )
}

export default BillingHistory

