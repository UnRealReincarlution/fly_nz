import React, { useEffect, useState } from 'react'
import styles from '@styles/Stocks.module.css'

import { Search as SearchIcon } from 'react-feather'
import Head from 'next/head'
import Link from 'next/link'

import Button from '@components/button'
import axios from 'axios'
import { resourceLimits } from 'node:worker_threads'

export const Search: React.FC<{ callback: Function }> = ({ callback }) => {
    const [ query, setQuery ] = useState("");
    const [ value, setValue ] = useState("");

    const [ searchSymbols, setSearchSymbols ] = useState([]); 
    const [ searchIndex, setSearchIndex ] = useState(-1);
    let ss = [];

    // useEffect(() => {
    //     //setSearchSymbols(ss);
    // }, [ss])

    // Update Search Symbols Dynamically.

    const [ focused, setFocused ] = useState(false);
    const [ results, setResults ] = useState(((process.browser) ? JSON.parse(localStorage.getItem('data-ref')).data : null));  

    return (
        <div className={`${styles.search} ${(focused) ? styles.searchFocused : styles.searchUnFocused }`}>
            <div className={styles.searchDiv}>
                <SearchIcon size={21} color={(focused) ? "#fdfdfd" : "#fdfdfd"} />

                <input 
                    type="text" 
                    placeholder={"Search Stocks"} 
                    onFocus={() => setFocused(true)} 
                    onBlur={() => setFocused(false)}
                    onChange={async (e) => {
                        setQuery(e.target.value);

                        setValue(e.target.value);
                        setSearchSymbols([]);
                        setSearchIndex(-1);
                    }}
                    onKeyDown={(e) => {
                        if(e.nativeEvent.key == "ArrowDown" && searchIndex+1 < searchSymbols.length)
                        {
                            console.log(searchSymbols[searchIndex+1].symbol);
                            setSearchIndex(searchIndex+1);
                        }

                        if(e.nativeEvent.key == "ArrowUp" && searchIndex >= 0)
                        {
                            console.log(searchSymbols[searchIndex-1].symbol);
                            setSearchIndex(searchIndex-1);
                        }
                        
                        if(e.nativeEvent.key == "Enter") 
                        {
                            debounce(async () => {
                                await axios.get(`https://cloud.iexapis.com/stable/stock/${value}/quote?token=pk_a1feb5ae49654f7cb82aaa9bd1fa3a77`)
                                .then((res) => {
                                    console.log(res);
    
                                    callback(res);
                                });
                            }, 2500)
                        }
                    }}
                />
            </div>

            <div className={`${styles.searchSuggestions} ${(!focused) ? styles.hidden : styles.visible}`}>
                {/* Suggested Responses / Queries */}

                {
                    (results !== undefined && query.length >= 2) ?
                        (() => {
                            let counter = 0;
                            ss = [];

                            return (
                                results.map((e, index) => {
                                    if(e.symbol.startsWith(query) && counter < 10) {
                                        counter++;

                                        ss.push(e);

                                        return (
                                            <div key={`ss${index}`} className={(searchSymbols[searchIndex].symbol == e.symbol) ? styles.selected : styles.deSelected}>
                                                <h5>{e.symbol}</h5>
                                            </div>
                                        )
                                    }
                                })
                            )
                        })()
                        
                        :
                        <></>                    
                }
            </div>
            
        </div>
    )
}

let refrence = new Date();

const debounce = (callback, time) => {
    let newDate = new Date();

    if(refrence.getDate() - newDate.getDate() >= time) {
        callback();
    }else{
        setTimeout(callback, time);
    }
}

export default Search