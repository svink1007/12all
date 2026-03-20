import React, {FC} from 'react';
import './styles.scss';
import {
    IonCol,
    IonGrid, IonIcon,
    IonItem,
    IonList,
    IonRow
} from '@ionic/react';
import {RouteComponentProps, useLocation} from 'react-router';
import {Routes} from "../../shared/routes";
import {
    home,
    playCircle,
    searchSharp,
    videocamSharp, settingsSharp, settingsOutline, barChartOutline
} from "ionicons/icons";

const SidebarVoD: React.FC = () => {
    const location = useLocation();

    return (
        <IonCol className={'!p-0 flex justify-between flex-col !pt-5 !min-h-[calc(89dvh)] !bg-[#1E1E1E] !m-0 overflow-hidden'} sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="2" sizeXl="2">
            <IonList className={'!mt-5 !pt-5'}>
                <IonItem routerLink={Routes.Home} lines="none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17.143" viewBox="0 0 16 17.143" className={"me-7"}>
                        <path id="home-svgrepo-com" d="M1,6.857V17.143H6.714V12.571a2.286,2.286,0,1,1,4.571,0v4.571H17V6.857L9,0Z" transform="translate(-1)" fill="#d4d4d4"/>
                    </svg>
                    <span>Home</span>
                </IonItem>

                <IonItem routerLink={Routes.SearchVoD} lines="none" color={"black"} className={location.pathname === Routes.SearchVoD ? '!text-[#30DF75] !bg-black' : ""}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18.44" height="18.441" viewBox="0 0 18.44 18.441" className={"me-7"} fill={location.pathname === Routes.SearchVoD ? '#30DF75' : "#d4d4d4"}>
                        <path id="Path_17204" data-name="Path 17204" d="M1696.841,3040.811l-5.049-5.049a7.082,7.082,0,1,0-1.427,1.426l5.049,5.05Zm-16.749-9.271a6.051,6.051,0,1,1,6.051,6.051A6.059,6.059,0,0,1,1680.093,3031.539Z" transform="translate(-1678.684 -3024.079)" fill="#d4d4d4" stroke="#d4d4d4" strokeLinejoin="bevel" strokeWidth="0.8"/>
                    </svg>
                    <span>Search</span>
                </IonItem>

                <IonItem routerLink={Routes.MyVoD} lines="none" color={"black"} className={location.pathname === Routes.MyVoD ? '!text-[#30DF75] !bg-black' : ""}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="13" viewBox="0 0 22 13" className={"me-7"} fill={location.pathname === Routes.MyVoD ? '#30DF75' : "#d4d4d4"}>
                        <g id="Group_31563" data-name="Group 31563" transform="translate(-160 -211)">
                            <rect id="Rectangle_15661" data-name="Rectangle 15661" width="15" height="13" rx="2" transform="translate(160 211)"/>
                            <path id="Polygon_277" data-name="Polygon 277" d="M5.662,1.29a1,1,0,0,1,1.677,0L12,8.455A1,1,0,0,1,11.157,10H1.843A1,1,0,0,1,1,8.455Z" transform="translate(172 224) rotate(-90)"/>
                        </g>
                    </svg>
                    <span>Media</span>
                </IonItem>

                <IonItem routerLink={Routes.MyChannel} lines="none" color={"black"} className={location.pathname === Routes.MyChannel ? '!text-[#30DF75] !bg-black' : ""}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 21 23" className={"me-7"} fill={location.pathname === Routes.MyChannel ? '#30DF75' : "#d4d4d4"}>
                        <path id="media-file-svgrepo-com" d="M10,1a1,1,0,0,0-.707.293l-6,6A1,1,0,0,0,3,8V20a3,3,0,0,0,3,3H8a1,1,0,0,0,0-2H6a1,1,0,0,1-1-1V9h5a1,1,0,0,0,1-1V3h7a1,1,0,0,1,1,1V7a1,1,0,0,0,2,0V4a3,3,0,0,0-3-3ZM9,7H6.414L9,4.414Zm3,10a5,5,0,1,1,5,5A5,5,0,0,1,12,17Zm5-7a7,7,0,1,0,7,7A7,7,0,0,0,17,10Zm-.445,4.168A1,1,0,0,0,15,15v4a1,1,0,0,0,1.555.832l3-2a1,1,0,0,0,0-1.664Z" transform="translate(-3 -1)" fillRule="evenodd"/>
                    </svg>
                    <span>Channels</span>
                </IonItem>
            </IonList>

            <IonList className={'!pb-5'}>
                <IonItem routerLink={Routes.Home} lines="none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 19.5 19.5" className={"me-7"}>
                        <path id="reports-svgrepo-com" d="M9,21h6M9,21V16m0,5H3.6a.6.6,0,0,1-.6-.6V16.6a.6.6,0,0,1,.6-.6H9m6,5V9m0,12h5.4a.6.6,0,0,0,.6-.6V3.6a.6.6,0,0,0-.6-.6H15.6a.6.6,0,0,0-.6.6V9m0,0H9.6a.6.6,0,0,0-.6.6V16" transform="translate(-2.25 -2.25)" fill="none" stroke="#d4d4d4" strokeWidth="1.5"/>
                    </svg>
                    <span>Reports</span>
                </IonItem>

                <IonItem routerLink={Routes.Home} lines="none">
                    <svg id="Group_31561" data-name="Group 31561" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 19.24 20.18" className={"me-7"}>
                        <path id="Path_15845" data-name="Path 15845" d="M-531.269,961.791a3.514,3.514,0,0,0-3.51,3.51,3.514,3.514,0,0,0,3.51,3.51,3.514,3.514,0,0,0,3.51-3.51A3.513,3.513,0,0,0-531.269,961.791Zm0,5.641a2.132,2.132,0,0,1-2.129-2.13,2.115,2.115,0,0,1,.622-1.507,2.118,2.118,0,0,1,1.505-.625l.25.017a2.131,2.131,0,0,1,1.882,2.115A2.132,2.132,0,0,1-531.269,967.432Z" transform="translate(540.889 -955.211)" fill="#d4d4d4"/>
                        <path id="Path_15846" data-name="Path 15846" d="M-523.267,971.534l1.4-2.423a1.621,1.621,0,0,0,.162-1.237,1.615,1.615,0,0,0-.759-.989l-.941-.544a1.211,1.211,0,0,1-.427-1.656,1.209,1.209,0,0,1,.425-.425l.942-.546a1.613,1.613,0,0,0,.76-.989,1.619,1.619,0,0,0-.147-1.21l-1.416-2.452a1.619,1.619,0,0,0-.989-.76,1.612,1.612,0,0,0-1.237.162l-.95.548a1.2,1.2,0,0,1-1.632-.458,1.2,1.2,0,0,1-.153-.573v-1.141a1.632,1.632,0,0,0-1.63-1.63h-2.82a1.632,1.632,0,0,0-1.63,1.63v1.22a1.049,1.049,0,0,1-.525.917l-.144.084a1.076,1.076,0,0,1-1.049,0l-1.017-.6a1.634,1.634,0,0,0-2.226.6l-1.4,2.423a1.633,1.633,0,0,0,.577,2.218l.958.553a1.2,1.2,0,0,1,.595,1.058,1.185,1.185,0,0,1-.595,1.025h0l-.939.544a1.617,1.617,0,0,0-.76.989,1.619,1.619,0,0,0,.163,1.236l1.4,2.428a1.632,1.632,0,0,0,2.2.615l.033-.018.946-.548a1.2,1.2,0,0,1,.591-.154,1.2,1.2,0,0,1,.608.165,1.187,1.187,0,0,1,.588,1.021v1.144a1.632,1.632,0,0,0,1.63,1.63h2.821a1.632,1.632,0,0,0,1.629-1.63v-1.147a1.194,1.194,0,0,1,.363-.845,1.128,1.128,0,0,1,.853-.339,1.207,1.207,0,0,1,.566.151l.951.549a1.611,1.611,0,0,0,1.237.163A1.616,1.616,0,0,0-523.267,971.534Zm-1.324-.474-1.167-.671a2.579,2.579,0,0,0-3.516.959,2.579,2.579,0,0,0-.34,1.269v1.394h-3.315v-1.395a2.557,2.557,0,0,0-.759-1.818,2.533,2.533,0,0,0-1.822-.75,2.578,2.578,0,0,0-1.274.341l-1.162.672-1.65-2.856,1.157-.67a2.569,2.569,0,0,0,1.2-1.58,2.577,2.577,0,0,0-.271-1.966,2.588,2.588,0,0,0-.927-.926l.123-.218h0l-.125.217-1.156-.668,1.649-2.856,1.227.706a2.445,2.445,0,0,0,2.43,0l.146-.083a2.449,2.449,0,0,0,1.218-2.1v-1.469h3.32v1.393a2.6,2.6,0,0,0,2.587,2.567,2.576,2.576,0,0,0,1.269-.34l1.162-.672,1.65,2.857-1.157.667a2.594,2.594,0,0,0-.925,3.546,2.59,2.59,0,0,0,.927.927l1.155.669Z" transform="translate(540.889 -955.211)" fill="#d4d4d4"/>
                    </svg>
                    <span>Settings</span>
                </IonItem>
            </IonList>
        </IonCol>
    );
};

export default SidebarVoD;
