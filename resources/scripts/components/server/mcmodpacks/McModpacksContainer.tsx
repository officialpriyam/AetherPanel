import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { Form, Formik } from 'formik';
import McModsRow from '@/components/server/mcmodpacks/McModpacksRow';
import tw from 'twin.macro';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import getMinecraftMcModpacks, {
  Context as ServerMcModPacksContext,
} from '@/api/server/mcmodpacks/getMinecraftMcModpacks';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Pagination from '@/components/elements/PaginationBagou';
import Select from '@/components/elements/Select';
import getMinecraftVersions from '@/api/server/mcmodpacks/getMinecraftVersions';
import { ServerContext } from '@/state/server';
import FlashMessageRender from '@/components/FlashMessageRender';
import styles from '@/components/server/addons-style.module.css';
import { ArchiveIcon } from '@heroicons/react/outline';

interface Values {
  search: string;
}

interface VersionItem {
  id: string;
}

const McModPacksContainer = () => {
  const { page, setPage, searchFilter, setSearchFilter, type, setType, version, setVersion, loader, setLoader } =
    useContext(ServerMcModPacksContext);
  const { clearFlashes, clearAndAddHttpError } = useFlash();
  const { data: minecraftMcModpacks, error, isValidating } = getMinecraftMcModpacks();
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(true);

  const submit = ({ search }: Values) => {
    clearFlashes('server:minecraftModpacks');
    setSearchFilter(search);
  };

  useEffect(() => {
    if (!error) {
      clearFlashes('server:minecraftModpacks');

      return;
    }

    clearAndAddHttpError({ error, key: 'server:minecraftModpacks' });
  }, [error]);

  useEffect(() => {
    setVersionsLoading(true);

    getMinecraftVersions(uuid)
      .then((data) => {
        setVersions(data);
      })
      .catch((e) => {
        clearAndAddHttpError({ error: e, key: 'server:minecraftModpacks' });
      })
      .finally(() => {
        setVersionsLoading(false);
      });
  }, [uuid]);

  if (!minecraftMcModpacks || (error && isValidating) || versionsLoading) {
    return <Spinner size={'large'} centered />;
  }

  return (
    <ServerContentBlock title={'Modpack Installer'} icon={ArchiveIcon}>
      <FlashMessageRender byKey={'server:minecraftModpacks'} css={tw`mb-4`} />
      <div className={styles.shell}>
        <header className={styles.hero}>
          <span className={styles.brand}>PriyxStudio Addons</span>
          <h2 className={styles.title}>Minecraft Modpack Installer</h2>
          <p className={styles.subtitle}>
            Browse curated modpacks and deploy them with modern controls designed for your Flash theme.
          </p>
        </header>

        <section className={styles.controls}>
          <div css={tw`flex flex-col gap-4`}>
            <div css={tw`flex flex-wrap gap-3`}>
              <div
                css={!['technicpack', 'voidswrath'].includes(type) ? tw`w-full lg:flex-1` : tw`w-full lg:flex-1`}
              >
                <Formik
                  onSubmit={submit}
                  initialValues={{
                    search: searchFilter,
                  }}
                  validationSchema={object().shape({
                    search: string().optional().min(1),
                  })}
                >
                  <Form>
                    <Field id={'search'} name={'search'} label={'Search modpacks'} type={'text'} />
                  </Form>
                </Formik>
              </div>
              <Select
                css={tw`w-full lg:w-48 mt-6`}
                onChange={(e) => setType(e.target.value)}
                defaultValue={type}
              >
                <option value={'curseforge'}>Curseforge</option>
                {/** <option value={'modrinth'}>Modrinth</option> */}
                <option value={'technicpack'}>TechnicPack</option>
                <option value={'ftb'}>FTB</option>
                <option value={'voidswrath'}>VoidsWrath</option>
              </Select>
              <Select
                css={
                  type === 'curseforge' && version === ''
                    ? tw`w-full lg:w-56 mt-6`
                    : ['technicpack', 'voidswrath'].includes(type)
                    ? tw`hidden`
                    : tw`w-full lg:w-48 mt-6`
                }
                onChange={(e) => setVersion(e.target.value)}
                defaultValue={version}
              >
                <option value={''}>All Versions</option>
                {versions.map((item, index) => {
                  return (
                    <option value={item.id} key={index}>
                      {item.id}
                    </option>
                  );
                })}
              </Select>
              {['ftb', 'modrinth'].includes(type) && (
                <Select
                  css={tw`w-full lg:w-48 mt-6`}
                  onChange={(e) => setLoader(e.target.value)}
                  defaultValue={loader}
                >
                  <option value={''}>All Loaders</option>
                  <option value={'forge'}>Forge</option>
                  <option value={'fabric'}>Fabric</option>
                </Select>
              )}
              {type === 'curseforge' && version !== '' && (
                <Select
                  css={tw`w-full lg:w-48 mt-6`}
                  onChange={(e) => setLoader(e.target.value)}
                  defaultValue={loader}
                >
                  <option value={''}>All Loaders</option>
                  <option value={'forge'}>Forge</option>
                  <option value={'fabric'}>Fabric</option>
                </Select>
              )}
            </div>
          </div>
        </section>
        <div className={styles.cardGrid}>
          <Pagination data={minecraftMcModpacks} onPageSelect={setPage} customcss={`grid grid-cols-2 gap-4`}>
            {({ items }) =>
              !items.length ? (
                <p css={tw`text-center text-sm text-neutral-300 col-span-2`}>
                  {page > 1
                    ? "Looks like we've run out of modpacks to show, try going back a page."
                    : 'No modpacks matched the current filters.'}
                </p>
              ) : (
                items.map((minecraftMcModpack, key) => (
                  <McModsRow key={key} minecraftMcModpack={minecraftMcModpack} type={type} />
                ))
              )
            }
          </Pagination>
        </div>
      </div>
    </ServerContentBlock>
  );
};

export default () => {
  const [page, setPage] = useState<number>(1);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [type, setType] = useState<string>('curseforge');
  const [version, setVersion] = useState<string>('');
  const [loader, setLoader] = useState<string>('');

  return (
    <ServerMcModPacksContext.Provider
      value={{ page, setPage, searchFilter, setSearchFilter, type, setType, version, setVersion, loader, setLoader }}
    >
      <McModPacksContainer />
    </ServerMcModPacksContext.Provider>
  );
};
