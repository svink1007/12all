import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import { IonCol, IonGrid, IonImg, IonLabel, IonRow, IonSpinner } from "@ionic/react";
import { useTranslation } from "react-i18next";
import starIconWhite from "../../../../images/icons/star-sharp-white.svg"
import { TransactionStarsTable } from "../../../../shared/types";
import { ReduxSelectors } from "../../../../redux/shared/types";
import { useDispatch, useSelector } from "react-redux";
import { BillingServices } from "../../../../services";
import { updateStarsBalance } from "../../../../shared/helpers";
import { setTotalStarBalance } from "../../../../redux/actions/billingRewardActions";

// type Props = {
//   setItemAsActive: (value: string) => void;
//   activeNav: string
// }

const StarTransactions: FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  // const menuItems = ["menu1", "menu2", "menu3", "menu4", "menu5", "menu6"];
  const { id, isAnonymous, jwt } = useSelector(({ profile }: ReduxSelectors) => profile)
  const [starsTable, setStarsTable] = useState<TransactionStarsTable[]>()

  useEffect(() => {
    const page = 1
    const pageSize = 100
    if (!isAnonymous && jwt) {
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
    <div className="star-transactions-status">
      <IonGrid fixed={true} className="table-grid">
        {/* <IonRow >
            <IonHeader className="table-header">
              <IonTitle>{t('billing.starsStatus.starsTransaction')}</IonTitle>
            </IonHeader>
          </IonRow> */}

        <IonRow className="stars-status-table w-[100%]">
          <IonCol size="auto" className="star-col-1" >{t('billing.starsStatus.date')}</IonCol>
          <IonCol size="auto" className="star-col-1" >{t('billing.starsStatus.type')}</IonCol>
          <IonCol size="auto" className="star-col-2" >{t('billing.starsStatus.description')}</IonCol>
          <IonCol size="auto" className="star-col-3" >
            <IonImg src={starIconWhite} />
            <IonLabel>{t('billing.starsStatus.stars')}</IonLabel>
          </IonCol>
        </IonRow>
        <hr className="horizontal-row" />

        {
          starsTable ? starsTable?.map((item, index) => {
            const splittedStars = item.amount.toString().match(/^([+-]?)(\d+)$/)?.slice(1)

                const date = new Date(item.date);

                const formattedDate = new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                }).format(date);

            return (
              <div key={index}>
                <IonRow className="stars-status-table">
                  <IonCol size="auto" className="star-col-1" >{formattedDate}</IonCol>
                  <IonCol size="auto" className="star-col-1" >{item.type}</IonCol>
                  <IonCol size="auto" className="star-col-2" >{item.description}</IonCol>
                  <IonCol size="auto" className="star-col-3" >
                    {/* <IonLabel>{splittedStars?.[0] === "" ? "+" : splittedStars?.[0]}</IonLabel> */}
                    <IonLabel style={{ marginRight: 10 }}>{`${splittedStars?.[0] === "" ? "+" : splittedStars?.[0]}${splittedStars?.[1]}`}</IonLabel>
                  </IonCol>
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

export default StarTransactions

