import React from 'react';
import { Dialog, DialogProps } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { useTranslation } from 'react-i18next';

interface RecoveryTokenDialogProps extends DialogProps {
    tokens: string[];
}

export default ({ tokens, open, onClose }: RecoveryTokenDialogProps) => {
    const { t } = useTranslation('flash/account');
    const grouped = [] as [string, string][];
    tokens.forEach((token, index) => {
        if (index % 2 === 0) {
            grouped.push([token, tokens[index + 1] || '']);
        }
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t('recoveryTokensDialog.title')}
            description={
                t('recoveryTokensDialog.description')
            }
            hideCloseIcon
            preventExternalClose
        >
            <Dialog.Icon position={'container'} type={'success'} />
            <CopyOnClick text={tokens.join('\n')} showInNotification={false}>
                <pre className={'bg-gray-800 rounded p-2 mt-6'}>
                    {grouped.map((value) => (
                        <span key={value.join('_')} className={'block'}>
                            {value[0]}
                            <span className={'mx-2 selection:bg-gray-800'}>&nbsp;</span>
                            {value[1]}
                            <span className={'selection:bg-gray-800'}>&nbsp;</span>
                        </span>
                    ))}
                </pre>
            </CopyOnClick>
            <div className={'mt-3 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100'}>
                {t('recoveryTokensDialog.alert')}
            </div>
            <Dialog.Footer>
                <Button.Text onClick={onClose}>{t('recoveryTokensDialog.doneButton')}</Button.Text>
            </Dialog.Footer>
        </Dialog>
    );
};
