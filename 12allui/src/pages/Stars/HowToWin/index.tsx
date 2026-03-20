import React, { useEffect, useState } from "react";
import "./styles.scss";
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonItem,
    IonList,
    IonTitle,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { chevronBack, star } from "ionicons/icons";
import Layout from "../../../components/Layout";

const HowToWin: React.FC = () => {

    const { t } = useTranslation();

    return (
        <Layout className="shop-layout">
            <div
                className={
                    "!w-[100%] !flex !justify-center !flex-row !items-center"
                }
            >
                <div className="how-to-win-layout">
                    <IonCard className={"!w-[100%] px-4 !overflow-y-auto !max-h-[80vh]"}>
                        <IonCardHeader
                            className={"!flex !justify-center !flex-row !items-center"}
                        >
                            <IonTitle className={"text-center text-white text-[1.75rem]"}>
                                {t("billing.win.title")}
                            </IonTitle>
                        </IonCardHeader>
                        <hr className="horizontalRow" />
                        <IonCardContent
                            className={"flex flex-col justify-center items-center gap-y-4"}
                        >
                            <IonTitle
                                className={"text-center text-white text-[0.75rem] lg:text-[1.15rem] pb-5 pt-7"}
                            >
                                GET PAID WHILE WATCHING AND SHARING TV - REGISTER NOW!
                            </IonTitle>

                            <div className="flex lg:flex-row flex-col gap-x-10 pb-5 lg:px-5 md:w-[95%] lg:w-[80%] justify-center">
                                <div className="bg-[#393939] lg:w-[50%] w-[100%]">
                                    <div className="divider w-100">
                                        <IonIcon
                                            aria-hidden="true"
                                            color={"primary"}
                                            className="w-[24px] h-[24px] absolute left-[50%] translate-x-[-50%]"
                                            icon={star}
                                            slot="start"
                                        ></IonIcon>
                                    </div>
                                    <div className="px-10 py-7">
                                        <b className="text-[1.05rem] text-start text-white">
                                            Signup Bonus
                                        </b>
                                        <br />
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    <b className="text-white">Signing</b> up to{" "}
                                                    <b className="text-white">One2All.TV</b> rewards you{" "}
                                                    <b className="text-white">100 stars</b>.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="divider w-100">
                                        <IonIcon
                                            aria-hidden="true"
                                            color={"primary"}
                                            className="w-[24px] h-[24px] absolute left-[50%] translate-x-[-50%]"
                                            icon={star}
                                            slot="start"
                                        ></IonIcon>
                                    </div>
                                    <div className="px-10 py-7">
                                        <b className="text-[1.05rem] text-start text-white">
                                            Daily Login Reward
                                        </b>
                                        <br />
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    Opening the <b className="text-white">Site/App</b>{" "}
                                                    every day give you{" "}
                                                    <b className="text-white">100 stars</b> the first time
                                                    you login.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="divider w-100">
                                        <IonIcon
                                            aria-hidden="true"
                                            color={"primary"}
                                            className="w-[24px] h-[24px] absolute left-[50%] translate-x-[-50%]"
                                            icon={star}
                                            slot="start"
                                        ></IonIcon>
                                    </div>
                                    <div className="px-10 pt-7">
                                        <b className="text-[1.05rem] text-start text-white">
                                            Additional Rewards
                                        </b>
                                        <br />
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    Choosing a{" "}
                                                    <b className="text-white">favourite stream</b> for the
                                                    first time give you{" "}
                                                    <b className="text-white">15 stars</b>.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="px-10 pb-7">
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    Setting up an <b className="text-white">avatar</b> for
                                                    the first time grants you{" "}
                                                    <b className="text-white">15 stars</b>.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="divider w-100">
                                        <IonIcon
                                            aria-hidden="true"
                                            color={"primary"}
                                            className="w-[24px] h-[24px] absolute left-[50%] translate-x-[-50%]"
                                            icon={star}
                                            slot="start"
                                        ></IonIcon>
                                    </div>
                                    <div className="px-10 pt-7">
                                        <b className="text-[1.05rem] text-start text-white">
                                            Earning Stars as a Host
                                        </b>
                                        <br />
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    When a <b className="text-white">hosting a room</b>,
                                                    every <b className="text-white">2 minutes</b> you earn{" "}
                                                    <b className="text-white">24 stars</b>.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="px-10 pb-7">
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    The <b className="text-white">minimum</b> watching
                                                    time to collect the first award is{" "}
                                                    <b className="text-white">10 minutes</b>.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#393939] lg:w-[50%] w-[100%]">
                                    <div className="divider w-100">
                                        <IonIcon
                                            aria-hidden="true"
                                            color={"primary"}
                                            className="w-[24px] h-[24px] absolute left-[50%] translate-x-[-50%]"
                                            icon={star}
                                            slot="start"
                                        ></IonIcon>
                                    </div>
                                    <div className="px-10 py-7">
                                        <b className="text-[1.05rem] text-start text-white">
                                            Earning Stars as a Viewer
                                        </b>
                                        <br />
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    Every <b className="text-white">2 minutes</b> of
                                                    watching in a room, you earn{" "}
                                                    <b className="text-white">12 stars</b>.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="divider w-100">
                                        <IonIcon
                                            aria-hidden="true"
                                            color={"primary"}
                                            className="w-[24px] h-[24px] absolute left-[50%] translate-x-[-50%]"
                                            icon={star}
                                            slot="start"
                                        ></IonIcon>
                                    </div>
                                    <div className="px-10 py-7">
                                        <b className="text-[1.05rem] text-start text-white">
                                            Invite and Earn
                                        </b>
                                        <br />
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    <b className="text-white">Invite your friends</b> to join the VLR and get rewarded for every user that joins and stays in the room 10 minutes and more.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="divider w-100">
                                        <IonIcon
                                            aria-hidden="true"
                                            color={"primary"}
                                            className="w-[24px] h-[24px] absolute left-[50%] translate-x-[-50%]"
                                            icon={star}
                                            slot="start"
                                        ></IonIcon>
                                    </div>
                                    <div className="px-10 pt-7">
                                        <b className="text-[1.05rem] text-start text-white">
                                            Monetizing Virtual Living Rooms (VLR)
                                        </b>
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    Opening a paid{" "}
                                                    <b className="text-white">
                                                        Virtual Living Room (VLR)
                                                    </b>{" "}
                                                    grants you{" "}
                                                    <b className="text-white">70% of the room price</b>{" "}
                                                    for very user that joins.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="px-10 pb-7">
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    <b className="text-white">
                                                        Sharing a paid stream earns
                                                    </b>{" "}
                                                    you{" "}
                                                    <b className="text-white">30% of the room price</b>{" "}
                                                    for very user that joins.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="divider w-100">
                                        <IonIcon
                                            aria-hidden="true"
                                            color={"primary"}
                                            className="w-[24px] h-[24px] absolute left-[50%] translate-x-[-50%]"
                                            icon={star}
                                            slot="start"
                                        ></IonIcon>
                                    </div>
                                    <div className="px-10 py-7">
                                        <b className="text-[1.05rem] text-start text-white">
                                            Earning from Free Rooms and Free VLRs
                                        </b>
                                        <br />
                                        <div className="flex items-start gap-x-1 justify-start">
                                            <b className="marker">•</b>
                                            <ul className="mt-3">
                                                <li>
                                                    Hosting a <b className="text-white">free room</b> or
                                                    opening a <b className="text-white">Free VLR</b>{" "}
                                                    rewards the host with{" "}
                                                    <b className="text-white">100 stars per user</b>,
                                                    provide the user stays for at least{" "}
                                                    <b className="text-white">5 minutes</b>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <b className="text-[1.25rem] text-center text-white">
                                You can cash out stars to{" "}
                                <span className="primary">REAL MONEY</span>
                            </b>
                            <br />
                            <br />
                        </IonCardContent>
                    </IonCard>
                </div>
            </div>
        </Layout>
    );
};

export default HowToWin;
