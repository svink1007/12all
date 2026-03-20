import {
  InfiniteScrollCustomEvent,
  IonContent,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItemDivider,
  IonLabel,
  IonList,
  IonPage,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Routes } from "../../shared/routes";
import { ReduxSelectors } from "../../redux/types";
import { BillingServices } from "../../services/BillingServices";
import { TransactionStarsTable } from "../../shared/types";
import { setErrorToast } from "../../redux/actions/toastActions";
import { setTotalStarBalance } from "../../redux/actions/billingRewardActions";

import "./styles.scss";
import Close from "../../images/settings/close.svg";
import Star from "../../images/profile-settings/star.svg";
import GrayStar from "../../images/profile-settings/gray-star.svg";
import SafeAreaView from "../../components/SafeAreaView";

const BillingHistory = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const { id, jwtToken } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );
  const [starsTable, setStarsTable] = useState<TransactionStarsTable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1); // Current page for pagination
  const [hasMore, setHasMore] = useState<boolean>(true); // Flag to check if more data is available
  const pageSize = 25; // Number of items per page
  const [balance, setBalance] = useState(0);

  const onCloseClick = () => {
    history.push(Routes.Broadcasts);
  };

  useEffect(() => {
    (async function () {
      const data = await BillingServices.billingStarBalance(id);
      if (data.data.status === "ok" && data.data.starsBalance > 0) {
        setBalance(data.data.starsBalance);
      }
    })();
  }, []);

  const loadMoreData = async (newPage: number) => {
    if (!jwtToken || !hasMore || loading) return;

    setLoading(true);
    try {
      const {
        data: { result, status },
      } = await BillingServices.billingStarsStatusTable(id, newPage, pageSize);
      if (status === "nok") {
        dispatch(
          setErrorToast("Something went wrong. Please try again later.")
        );
        setStarsTable([]);
        setHasMore(false);
      } else if (status === "ok") {
        const starsBalance = await BillingServices.updateStarsBalance(id);
        dispatch(setTotalStarBalance(starsBalance));
        setStarsTable((prevStarsTable) => [
          ...prevStarsTable,
          ...result.transactions,
        ]); // Append new data
        if (result.transactions.length < pageSize) {
          setHasMore(false); // No more data to load
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      dispatch(setErrorToast("Something went wrong. Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  // Load initial data for the first page
  useEffect(() => {
    loadMoreData(1); // Load the first page only once on component mount
  }, [id, jwtToken, dispatch]);

  const loadData = (event: any) => {
    setTimeout(() => {
      const newPage = page + 1;
      setPage(newPage);
      loadMoreData(newPage).then(() =>
        (event as InfiniteScrollCustomEvent).target.complete()
      );
    }, 500);
  };

  console.log("STARTSSSS:", starsTable);

  return (
    <IonPage>
      <IonContent>
        <SafeAreaView>
          <div className="history-container">
            <div className="history-header">
              <IonImg
                src={Close}
                className="history-close"
                onClick={onCloseClick}
              />
              <div className="history-header-title">
                <p>{t("billingHistory.history")}</p>
                <p className="history-header-meeting-link"></p>
              </div>
            </div>
            <div className="billing-history-container">
              <div className="billing-history-body">
                <p className="balance-text">
                  {t("billingHistory.currentBalance")}
                </p>
                <img className="star-avatar" src={Star} />
                <div className="stars-balance">
                  <p>
                    {t("billingHistory.total")}: {balance}{" "}
                    {t("billingHistory.stars")}
                  </p>
                </div>
              </div>
            </div>
            <div className="billing-history-body">
              {/* <div className="billing-history-header">
                {t("billingHistory.header")}
              </div> */}
              <div className="history-list-header-container">
                <div className="transaction-header-1">
                  <p>{t("billingHistory.date")}</p>
                  <p>{t("billingHistory.type")}</p>
                </div>
                <div className="transaction-header-2">
                  <p>Stars</p>
                  <p>Value</p>
                  <p>Cost</p>
                </div>
              </div>
              <IonItemDivider />
              <IonList>
                {starsTable.map((transaction, index) => {
                  const splittedDate = transaction.date.substring(0, 10);

                  return (
                    <div
                      className="transaction-item-container"
                      key={`history-${index}`}
                    >
                      <div key={index} className="transaction-data-container">
                        <IonLabel>
                          <div className="transaction-row">
                            <div className="transaction-date">
                              {splittedDate}
                            </div>
                            <div className="transaction-type">
                              {transaction.type}
                            </div>
                          </div>
                        </IonLabel>
                        <div className="transaction-stars-container">
                          {/* <IonLabel>
                            {splittedStars?.[0] === "" ? "+" : "-"}
                          </IonLabel> */}
                          <IonLabel className="transaction-stars" slot="end">
                            {transaction.amount}
                          </IonLabel>
                          <IonLabel className="transaction-stars" slot="end">
                            {transaction.amount < 0
                              ? Math.abs(transaction.cashAmount).toFixed(3)
                              : ""}
                          </IonLabel>
                          <IonLabel className="transaction-stars" slot="end">
                            {transaction.amount > 0
                              ? transaction.cashAmount.toFixed(3)
                              : ""}
                          </IonLabel>
                        </div>
                      </div>
                      <IonItemDivider className="transaction-item-divider" />
                    </div>
                  );
                })}
                {hasMore && (
                  <IonInfiniteScroll
                    onIonInfinite={(e) => loadData(e)}
                    threshold="100px"
                  >
                    <IonInfiniteScrollContent
                      loadingSpinner="bubbles"
                      loadingText="Loading more transactions..."
                    ></IonInfiniteScrollContent>
                  </IonInfiniteScroll>
                )}
              </IonList>
            </div>
          </div>
        </SafeAreaView>
      </IonContent>
    </IonPage>
  );
};

export default BillingHistory;
