import React, { useEffect, useState } from 'react'
import { useDebounce } from 'usehooks-ts';

export const useScrollTop = (): [number, boolean] => {

    const [atBottom, setAtBottom] = useState(false)
    const [scrollTop, setScrollTop] = useState(0)

    const handleScroll = () => {
        const position = window.pageYOffset;
        setScrollTop(position);
        if (window.innerHeight + position >= document.getElementById('root').clientHeight - 1) {
            if (!atBottom)
                setAtBottom(true)
        } else {
            if (atBottom)
                setAtBottom(false)
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return [scrollTop, atBottom]
}
