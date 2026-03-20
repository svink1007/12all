import React, {FC, useCallback, useEffect, useState} from 'react';
import './styles.scss';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonGrid, IonIcon, IonInput,
    IonItem,
    IonSearchbar,
    IonRow,
    IonContent, IonSpinner
} from '@ionic/react';
import Layout from '../../components/Layout';
import { useLocation } from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';
import SidebarVoD from "../../components/SidebarVOD";
import { Tabs } from '@base-ui-components/react/tabs';
import {useDispatch, useSelector} from "react-redux";
import {VodChannelItem, VodState} from "../../redux/reducers/vodReducers";
import {VodService} from "../../services/VodService";
import {loadVods} from "../../redux/actions/vodActions";
import {setErrorToast} from "../../redux/actions/toastActions";
import NotingFound from "../../pages/Home/NotingFound";
import VodSlide from "../../components/VodRoom";
import {Routes} from "../../shared/routes";
import { useHistory } from 'react-router-dom';

const MyVoD: React.FC = () => {
    const {t, i18n} = useTranslation();

    const dispatch = useDispatch();

    const location = useLocation();
    const history = useHistory();

    const queryParams = new URLSearchParams(location.search);

    const [query, setQuery] = useState<string | null>(queryParams.get('query') ?? null);
    const [loading, setLoading] = useState<boolean>(false);

    const [result, setResult] = useState<VodState[]>([]);
    const [channelResult, setChannelResult] = useState<VodChannelItem[]>([]);

    useEffect(() => {
        async function fetchVod(q: string | null) {
            setLoading(true);
            console.log(q?.length, q?.length || 0 === 0 ? null : q)
            const response = await VodService.searchVod(q?.length === 0 ? null : q);
            if (response.status === 200) {
                setResult(response.data);

                const uniqueItems = Array.from(
                    new Map(
                        response.data
                            .flatMap((v) => v.shared_streams)
                            .map((item) => [item.id, item]) // Use `id` as key
                    ).values()
                );

                setChannelResult(uniqueItems);
            } else {
                dispatch(setErrorToast("Failed to load VODs"));
            }
            setLoading(false);
        }
        fetchVod(query);
    }, [query]);

    return (
        <Layout className="about-page">
            <PerfectScrollbar>
                <IonGrid className={'!p-0 !m-0'}>
                    <IonRow className={'!p-0 !m-0'}>
                        <SidebarVoD />

                        <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="10" sizeXl="10">
                            <IonCard className="about-card">
                                <IonCardHeader>
                                    <IonCardTitle className={"flex items-center justify-between gap-x-10"}>
                                        <b>
                                            {t('vod.search')}
                                        </b>
                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            history.push(Routes.SearchVoD + "?query=" + query)
                                        }} className={"flex gap-x-3 w-[35%] justify-end items-center"}>
                                            {
                                                loading ? <IonSpinner></IonSpinner> : <></>
                                            }
                                            <IonSearchbar onIonChange={(e) => setQuery(`${e.target.value}`)} className={"!w-[75%]"} color={'dark'} value={query}/>
                                            <input type="hidden" name="query" value={query ?? ""} />
                                        </form>
                                    </IonCardTitle>

                                </IonCardHeader>
                            </IonCard>

                            <IonCard className={'!h-[92.3%]'}>
                                <IonCardContent className="about-content">
                                    <Tabs.Root className="rounded-md border-0" defaultValue="vod">
                                        <Tabs.List className="relative z-0 flex gap-1 px-1">
                                            <Tabs.Tab
                                                className="flex h-8 items-center justify-center border-0 px-3 !py-3 text-sm font-medium text-white outline-none select-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 focus-visible:relative focus-visible:before:absolute focus-visible:before:outline focus-visible:before:outline-2 data-[selected]:font-bold"
                                                value="vod"
                                            >
                                                Video On Demand (<b>{result.length}</b>)
                                            </Tabs.Tab>
                                            <Tabs.Tab
                                                className="flex h-8 items-center justify-center border-0 px-3 !py-3 text-sm font-medium text-white outline-none select-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 focus-visible:relative focus-visible:before:absolute focus-visible:before:outline focus-visible:before:outline-2 data-[selected]:font-bold"
                                                value="channel"
                                            >
                                                Channel (<b>{channelResult.length}</b>)
                                            </Tabs.Tab>
                                            <Tabs.Indicator className="absolute top-1/2 left-0 z-[-1] h-6 w-[var(--active-tab-width)] -translate-y-1/2 translate-x-[var(--active-tab-left)] rounded-sm bg-[#E0007A]  font-black transition-all duration-200 ease-in-out" />
                                        </Tabs.List>
                                        <Tabs.Panel
                                            className="relative flex items-start justify-start px-1 pt-3 -outline-offset-1 outline-blue-800 focus-visible:rounded-md focus-visible:outline focus-visible:outline-2"
                                            value="vod"
                                        >
                                            <div
                                                className="!bg-[#1E1E1E] flex gap-x-5 justify-start items-start !h-[full]"
                                                color="transparent"
                                            >
                                                {result.length === 0 ? (
                                                    <NotingFound />
                                                ) : (
                                                    <>
                                                        {
                                                            result.map((vod) => <VodSlide key={vod.id} vod={vod} />)
                                                        }
                                                    </>
                                                )}
                                                <div className={'!h-[100px]'}></div>
                                            </div>
                                        </Tabs.Panel>
                                        <Tabs.Panel
                                            className="relative flex items-center justify-center -outline-offset-1 outline-blue-800 focus-visible:rounded-md focus-visible:outline focus-visible:outline-2"
                                            value="channel"
                                        >
                                            {channelResult.length === 0 ? (
                                                <NotingFound />
                                            ) : (
                                                <>
                                                    {
                                                        channelResult.map((channel) => <li key={channel.id}>{JSON.stringify(channel)}</li>)
                                                    }
                                                </>
                                            )}
                                            <div className={'!h-[100px]'}></div>
                                        </Tabs.Panel>
                                    </Tabs.Root>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </PerfectScrollbar>
        </Layout>
    );
};

export default MyVoD;
