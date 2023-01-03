import React, { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { cdnPrefix } from '../../../config/urls';
import './SearchInput.scss';

const SearchInput = (props) => {
    const { onChange } = props
    const [val, setVal] = useState('')

    const foo = useDebouncedCallback(
        (keyword) => {
            onChange(keyword)
        },
        500
    );

    return <div className="search-input-wrapper">
        <img src={cdnPrefix + "search.svg"} className="icon" alt="Search" onClick={() => foo(val)} />
        <input placeholder='Search' id={'search-input'} onChange={e => {
            foo(e.target.value)
            setVal(e.target.value)
        }} />

    </div>
}

export default SearchInput