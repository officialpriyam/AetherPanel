import React from 'react';
import { Trans, TransProps, useTranslation } from 'react-i18next';

type Props = React.PropsWithChildren<Omit<React.ComponentProps<typeof Trans>, 't'>>;

const Translate: React.FC<Props> = ({ ns, children, ...props }) => {
    const { t } = useTranslation(ns);

    return (
        <Trans t={t} {...props}>
            {children}
        </Trans>
    );
};

export default Translate;
