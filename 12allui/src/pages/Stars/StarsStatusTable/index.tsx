import React, { useEffect, useState } from "react";
import "./styles.scss";
import {
  IonCol,
  IonGrid,
  IonHeader,
  IonImg,
  IonLabel,
  IonRow,
  IonTitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
} from "@ionic/react";
import Layout from "../../../components/Layout";
import { useTranslation } from "react-i18next";
import starIconWhite from "../../../images/icons/star-sharp-white.svg";
import { BillingServices } from "../../../services";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import { TransactionStarsTable } from "../../../shared/types";
import CurrentBalanceBox from "../../../components/CurrentBalance";
import { setErrorToast } from "../../../redux/actions/toastActions";
import { updateStarsBalance } from "../../../shared/helpers";
import { setTotalStarBalance } from "../../../redux/actions/billingRewardActions";

const StarsStatusTable: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id, isAnonymous, jwt } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );
  const [starsTable, setStarsTable] = useState<TransactionStarsTable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1); // Current page for pagination
  const [hasMore, setHasMore] = useState<boolean>(true); // Flag to check if more data is available
  const pageSize = 25; // Number of items per page

  // Function to load data based on the current page
  const loadMoreData = async (newPage: number) => {
    if (!jwt || isAnonymous || !hasMore || loading) return;

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
        const starsBalance = await updateStarsBalance(id);
        dispatch(setTotalStarBalance(starsBalance));
        const newTransactions = [...starsTable, ...result.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setStarsTable(newTransactions); // Append new data
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
  }, [id, jwt, isAnonymous, dispatch]);

  // Load more data on scroll
  const loadData = (event: any) => {
    setTimeout(() => {
      const newPage = page + 1;
      setPage(newPage);
      loadMoreData(newPage).then(() =>
        (event as InfiniteScrollCustomEvent).target.complete()
      );
    }, 500);
  };

  return (
    <Layout className="stars-status-layout">
      <IonHeader>
        <IonTitle>{t("billing.starsStatus.header")}</IonTitle>
      </IonHeader>

      <div className="status-table-balance-box">
        <CurrentBalanceBox starsLabel={t("billing.starsStatus.currentBal")} />
      </div>

      <div className="stars-status-table-container">
        <IonGrid fixed={true} className="table-grid !overflow-y-auto !max-h-[80vh]">
          <IonRow>
            <IonHeader className="table-header">
              <IonTitle>{t("billing.starsStatus.starsTransaction")}</IonTitle>
            </IonHeader>
          </IonRow>

          <IonRow className="stars-status-table">
            <IonCol size="auto" className="star-col-2">
              {t("billing.starsStatus.date")}
            </IonCol>
            <IonCol size="auto" className="star-col-1">
              {t("billing.starsStatus.type")}
            </IonCol>
            <IonCol size="auto" className="star-col-3">
              {t("billing.starsStatus.description")}
            </IonCol>
            <IonCol size="auto" className="star-col-4">
              <IonImg src={starIconWhite} />
              <IonLabel>{t("billing.starsStatus.stars")}</IonLabel>
            </IonCol>
          </IonRow>
          <hr className="horizontal-row" />

          {starsTable.map((item, index) => {
            const splittedStars = item.amount
              .toString()
              .match(/^([+-]?)(\d+)$/)
              ?.slice(1);

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
                  <IonCol size="auto" className="star-col-2">
                    {formattedDate}
                  </IonCol>
                  <IonCol size="auto" className="star-col-1">
                    {item.type}
                  </IonCol>
                  <IonCol size="auto" className="star-col-3">
                    {item.description}
                  </IonCol>
                  <IonCol size="auto" className="star-col-4">
                    <IonLabel style={{ marginRight: 10 }}>{`${
                      splittedStars?.[0] === "" ? "+" : splittedStars?.[0]
                    }${splittedStars?.[1]}`}</IonLabel>
                  </IonCol>
                </IonRow>
                <hr className="horizontal-row" />
              </div>
            );
          })}

          {/* {loading && (
            <IonRow className="stars-table-spinner">
              <IonSpinner />
            </IonRow>
          )} */}

          {/* Infinite Scroll Component */}
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
        </IonGrid>
      </div>
    </Layout>
  );
};

export default StarsStatusTable;
