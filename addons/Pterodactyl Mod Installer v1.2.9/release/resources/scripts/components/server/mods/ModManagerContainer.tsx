import Spinner from '@/components/elements/Spinner';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { style, config } from '@/components/ModInstallerConfig';

import tw from 'twin.macro';
import ModContainer from './ModContainer';
import { ServerContext } from '@/state/server';
import searchMods from '@/api/server/mods/searchMods';
import getMod from '@/api/server/mods/getMod';
import { Mod } from './types';
import loadDirectory from '@/api/server/files/loadDirectory';
import searchMod from '@/api/server/mods/searchMod';
import Icon from '@/components/elements/Icon';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const [mods, setMods] = useState<Mod[]>();

    const [search, setSearch] = useState('');

    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(true);

    const [category, setCategory] = useState(6);

    const [version, setVersion] = useState('');

    const inputRef = useRef(null);

    const [noModsFolder, setNoModsFolder] = useState(false);

    async function getDefaultPage(): Promise<Mod[]> {
        setLoading(true);

        const mods = await loadDirectory(uuid, 'mods/').catch(() => {
            setNoModsFolder(true);
        });

        if (!mods) {
            return [];
        }

        if (category === 10) {
            const mods = await loadDirectory(uuid, 'mods/');

            const reqs: Promise<any>[] = [];

            for (let i = 0; i < mods.length; i++) {
                if (mods[i].name.split('-').length >= 3) {
                    const modId = parseInt(mods[i].name.split('-')[mods[i].name.split('-').length - 2].substring(1));

                    if (Number.isNaN(modId)) {
                        reqs.push(searchMod(mods[i].name.split('-')[0]));
                        continue;
                    }

                    reqs.push(getMod(modId));
                } else {
                    reqs.push(searchMod(mods[i].name.split('-')[0]));
                }
            }

            const data = await Promise.all(reqs);

            const rd: Mod[] = [];

            data.forEach((e) => {
                if (e) {
                    rd.push(e);
                }
            });

            return rd;
        }

        return await searchMods(page, search, category);
    }

    async function setModsDefault() {
        const oldSearch = search.slice();

        const p = await getDefaultPage();

        if (oldSearch !== inputRef.current!['value']) {
            return;
        }

        setMods(p);
        setLoading(false);
    }

    function onSearch(event: ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
    }

    function increasePage() {
        setPage(page + 1);
    }

    function decreasePage() {
        setPage(page - 1);
    }

    useEffect(() => {
        setLoading(true);
    }, []);

    useEffect(() => {
        setModsDefault();
    }, [search, page, category]);

    if (noModsFolder) {
        return (
            <>
                <div css={tw`flex items-center justify-center w-full my-4`}>
                    <div css={tw`flex items-center bg-neutral-900 rounded p-3 text-red-500`}>
                        <Icon icon={faExclamationTriangle} css={tw`h-4 w-auto mr-2`} />
                        <p css={tw`text-sm text-neutral-100`}>
                            No mods folder found. Please create a mods folder before installing mods.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className={`mx-10 mt-5 sm:flex`}>
                <div
                    className={`flex w-full sm:w-auto my-2 sm:my-0 border-2 ${style.rounding ?? ''}`}
                    style={{
                        backgroundColor: style.primaryColor,
                        borderColor: style.secondaryColor,
                    }}
                >
                    <button
                        style={{
                            backgroundColor: style.primaryColor,
                            borderColor: style.secondaryColor,
                        }}
                        className={`w-full sm:w-8 rounded-l-full hover:font-black`}
                        disabled={page === 0}
                        onClick={decreasePage}
                    >
                        &#60;
                    </button>
                    <div
                        style={{
                            backgroundColor: style.primaryColor,
                            borderColor: style.secondaryColor,
                        }}
                        className={`text-2xl pt-2 border-0 h-12 w-full sm:w-8 text-center`}
                    >
                        {page + 1}
                    </div>
                    <button
                        style={{
                            backgroundColor: style.primaryColor,
                            borderColor: style.secondaryColor,
                        }}
                        className={`w-full sm:w-8 rounded-r-full hover:font-black`}
                        disabled={!mods || mods.length < config.amountPerPage}
                        onClick={increasePage}
                    >
                        &#62;
                    </button>
                </div>
                <input
                    onChange={onSearch}
                    ref={inputRef}
                    size={20}
                    className={`bg-neutral-700 border-2 border-cyan-700 text-lg p-2 sm:ml-5 my-4 sm:my-0 w-full ${
                        style.rounding ?? ''
                    }`}
                    style={{ backgroundColor: style.primaryColor, borderColor: style.secondaryColor }}
                    placeholder={'Search'}
                />
                <select
                    style={{
                        backgroundColor: style.primaryColor,
                        borderColor: style.secondaryColor,
                    }}
                    className={`bg-neutral-700 border-2 text-lg p-2 sm:ml-5 my-2 sm:my-0 w-full sm:w-auto text-center ${
                        style.rounding ?? ''
                    }`}
                    value={version}
                    onChange={(event) => {
                        setVersion(event.target.value);
                    }}
                >
                    <option value={'Any'}>Any</option>
                    <option value={'1.7.10'}>1.7.10</option>
                    <option value={'1.8.9'}>1.8.9</option>
                    <option value={'1.9.4'}>1.9.4</option>
                    <option value={'1.10.2'}>1.10.2</option>
                    <option value={'1.11.2'}>1.11.2</option>
                    <option value={'1.12.2'}>1.12.2</option>
                    <option value={'1.13.2'}>1.13.2</option>
                    <option value={'1.14.4'}>1.14.4</option>
                    <option value={'1.15.2'}>1.15.2</option>
                    <option value={'1.16.5'}>1.16.5</option>
                    <option value={'1.17.1'}>1.17.1</option>
                    <option value={'1.18.2'}>1.18.2</option>
                    <option value={'1.19.2'}>1.19.2</option>
                    <option value={'1.20.2'}>1.20.2</option>
                </select>
                <select
                    style={{ backgroundColor: style.primaryColor, borderColor: style.secondaryColor }}
                    className={`bg-neutral-700 border-2 border-cyan-700 text-lg p-2 sm:ml-5 w-full sm:w-auto ${
                        style.rounding ?? ''
                    }`}
                    defaultValue={category}
                    onChange={(event) => {
                        setCategory(parseInt(event.target.value));
                    }}
                >
                    <option value={0}>none</option>
                    <option value={1}>Featured</option>
                    <option value={2}>Popularity</option>
                    <option value={3}>Last Updated</option>
                    <option value={4}>Name</option>
                    <option value={5}>Author</option>
                    <option value={6}>Total Downloads</option>
                    <option value={7}>Category</option>
                    <option value={8}>Game Version</option>
                    <option value={10}>Installed</option>
                </select>
            </div>
            {loading ? (
                <Spinner size='large' centered></Spinner>
            ) : (
                <div css={tw`grid md:grid-rows-4 md:grid-cols-4 mt-4 mx-10 gap-4`}>
                    {mods!.map((mod) => (
                        <ModContainer key={Math.random()} gameVersion={version} mod={mod} />
                    ))}
                </div>
            )}
        </>
    );
};
