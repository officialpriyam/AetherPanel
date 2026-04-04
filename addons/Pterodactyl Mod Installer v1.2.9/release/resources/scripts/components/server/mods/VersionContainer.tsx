import http from '@/api/http';
import { style } from '@/components/ModInstallerConfig';
import { ServerContext } from '@/state/server';
import React from 'react';
import tw from 'twin.macro';
import { ModFile } from './types';

interface Props {
    file: ModFile;
    setInstalled: (installed: boolean) => void;
}

export default ({ file, setInstalled }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    async function downloadPlugin() {
        let downloadUrl = file.downloadUrl;

        downloadUrl = downloadUrl.replace(' ', '+');

        downloadUrl = downloadUrl.replace('edge', 'media');

        http.post(`/api/client/servers/${uuid}/files/pull`, {
            url: downloadUrl,
            directory: 'mods/',
        });

        setInstalled(true);
    }

    return (
        <>
            <div style={{ backgroundColor: style.primaryColor }} css={tw`rounded-lg grid p-4`}>
                <div css={tw`mx-auto`}>Version: {file.displayName}</div>
                <div css={tw`mx-auto`}>Downloads: {file.downloadCount.toLocaleString(undefined)}</div>
                <button css={style.buttonInstall} onClick={downloadPlugin}>
                    {'Install'}
                </button>
            </div>
        </>
    );
};
