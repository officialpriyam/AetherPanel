import PageContentBlock, { PageContentBlockProps } from '@/components/elements/PageContentBlock';
import React from 'react';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import { ServerContext } from '@/state/server';

interface Props extends PageContentBlockProps {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
}

const ServerContentBlock: React.FC<Props> = ({ title, icon: Icon, children, ...props }) => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const pageTitle = String(useStoreState((state: ApplicationStore) => state.settings.data!.flash.pageTitle));

    return (
        <PageContentBlock title={`${name} | ${title}`} {...props}>
            {pageTitle == 'true' && Icon &&
                <div className={'flex items-center gap-x-3 mb-6'}>
                    <div
                        css={'background: rgba(30, 41, 59, 0.92); border: 1px solid rgba(148, 163, 184, 0.16);'}
                        className={'w-10 h-10 rounded-component !border-none flex items-center justify-center text-blue-300 backdrop'}
                    >
                        <Icon className={'w-6'} />
                    </div>
                    <p className={'text-lg font-medium text-gray-300'}>
                        {title}
                    </p>
                </div>
            }
            {children}
        </PageContentBlock>
    );
};

export default ServerContentBlock;
