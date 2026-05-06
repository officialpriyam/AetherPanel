import React from 'react';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import StatGraphs from '@/components/server/console/StatGraphs';
import SideGraphs from '@/components/server/console/SideGraphs';
import { ViewGridIcon } from '@heroicons/react/outline';
import Sftp from '@/components/server/dashboard/SFTP';
import Banner from '@/components/server/dashboard/Banner';
import InfoCardAdvanced from '@/components/server/dashboard/InfoCardAdvanced';
import InfoCard from '@/components/server/dashboard/InfoCard';
import { useTranslation } from 'react-i18next';

interface Props {
    type: string;
}

const Component = ({ type }: Props) => {
    return  type == 'banner'
            ? <Banner />

            : type == 'statCards'
            ? <div className={'lg:col-span-2'}>
                <ServerDetailsBlock />
              </div>
            
            : type == 'graphs'
            ? <div className={'lg:col-span-2 grid lg:grid-cols-3 gap-4'}>
                <StatGraphs />
              </div>
            
            : type == 'sideGraphs' 
            ? <div className={'col-span-1 row-span-2'}>
                <div className={'w-full flex flex-col gap-4'}>
                    <SideGraphs />
                </div>
              </div>
            
            : type == 'SFTP'
            ? <Sftp />
            
            : type == 'info'
            ? <InfoCard />

            : type == 'infoAdvanced'
            ? <InfoCardAdvanced />
            : null
}


const DashboardContainer = () => {
    const { t } = useTranslation('flash/server/dashboard');
    const slot1 = useStoreState((state: ApplicationStore) => state.settings.data!.flash.slot1);
    const slot2 = useStoreState((state: ApplicationStore) => state.settings.data!.flash.slot2);
    const slot3 = useStoreState((state: ApplicationStore) => state.settings.data!.flash.slot3);
    const slot4 = useStoreState((state: ApplicationStore) => state.settings.data!.flash.slot4);
    const slot5 = useStoreState((state: ApplicationStore) => state.settings.data!.flash.slot5);
    const slot6 = useStoreState((state: ApplicationStore) => state.settings.data!.flash.slot6);
    const slot7 = useStoreState((state: ApplicationStore) => state.settings.data!.flash.slot7);

    return(
        <ServerContentBlock title={t('dashboard')} icon={ViewGridIcon}>
            <div className={'grid lg:grid-cols-2 grid-cols-1 gap-4'}>
                <Component type={slot1} />
                <Component type={slot2} />
                <Component type={slot3} />
                <Component type={slot4} />
                <Component type={slot5} />
                <Component type={slot6} />
                <Component type={slot7} />
            </div>
        </ServerContentBlock>
    )
}

export default DashboardContainer;