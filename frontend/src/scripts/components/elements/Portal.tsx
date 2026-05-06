import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const PORTAL_CLASS = 'flash-ui-portal-root';

export default ({ children }: { children: React.ReactNode }) => {
    const [element, setElement] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        const div = document.createElement('div');
        div.className = PORTAL_CLASS;
        div.style.position = 'fixed';
        div.style.inset = '0';
        div.style.zIndex = '120';
        div.style.pointerEvents = 'none';

        document.body.appendChild(div);
        setElement(div);

        return () => {
            div.remove();
        };
    }, []);

    if (!element) {
        return null;
    }

    return createPortal(children, element);
};
