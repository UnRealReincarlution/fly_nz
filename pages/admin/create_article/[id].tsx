import { useEffect, useState } from 'react' 

import styles from '@styles/Home.module.css'
import articleSyles from '@styles/Article.module.css'

import Header from '@components/header'
import Footer from '@components/footer'
import NewElement from '@components/new_element_arc'

import BuildParent from '@components/build_parent'
import { ClientContext } from '@components/context'

import client from '@components/client'
import { useRouter } from 'next/router'

import { Check, RefreshCw } from 'react-feather'

const INDEX = (process.browser) ? window.location.href.split('/')[window.location.href.split('/').length - 1] : null;

export default function Home() {
    const [ articleData, setArticleData ] = useState(null);
    const [ articleContent, setArticleContent ] = useState<{type: string, content: string, input: boolean}[]>(null);
    const [ informationUpdated, setInformationUpdated ] = useState(false);

    useEffect(() => {
        if(process.browser)
            client
                .from('articles')
                .select()
                .eq('id', INDEX)
                .then(e => {
                    if(e.data) {
                        setArticleData(
                            { 
                                ...e.data[0], 
                                content: 
                                    ( e.data[0].content == [] ? 
                                        [{ type: "p", content: 'START WRITING HERE', input: false}] 
                                        : 
                                        e.data[0].content
                                    ) 
                            }
                        );

                        setArticleContent(e.data[0].content)
                    }
                });
    }, []);

    useEffect(() => {
        if(!articleData) return;

        setInformationUpdated(false);

        const filteredData = articleContent?.filter(e => e.content !== '');
        if(JSON.stringify(articleContent) !== JSON.stringify(filteredData)) setArticleContent(filteredData);

        if(JSON.stringify(articleData) !== JSON.stringify({ ...articleData, content: filteredData })) debounceStorageUpdate({ ...articleData, content: filteredData }, (e) => {
            setInformationUpdated(true)
        });
    }, [articleContent]);

    // useEffect(() => {
    //     setInformationUpdated(false);

    //     const filteredData = articleContent?.filter(e => e.content !== '');
    //     if(articleData) debounceStorageUpdate({ ...articleData, content: filteredData }, setInformationUpdated);
    // }, [articleData])

    return (
        <div className={styles.container}>
            <Header title={articleData?.title ? articleData?.title : 'create'}/>
            
            <div className={articleSyles.article}>
                <section className={articleSyles.articleHeader}>
                    <div>
                        <h1>{ articleData?.title }</h1>

                        {
                            informationUpdated ?
                            <div className={articleSyles.articleSynced}>
                                Synced 
                                <Check size={18} />
                            </div>
                            :
                            <div className={articleSyles.articleSyncing}>
                                Syncing
                                <RefreshCw size={18} />
                            </div>
                        }
                    </div>
                </section>

                <section className={articleSyles.articleBody}>
                    <ClientContext.Provider value={{ articleContent, setArticleContent }}>
                        <NewElement index={0} callmap={articleContent} callback={setArticleContent}/>
                        {
                            articleContent?.map((element, index) => {
                                return (
                                    <div key={Math.random() * 10000}>
                                        <BuildParent content={[index, element]} callback={setArticleContent} />

                                        <NewElement index={index+1} callmap={articleContent} callback={setArticleContent} />
                                    </div>
                                )
                            })
                        }
                    </ClientContext.Provider>
                </section>
            </div>  

            <Footer />  
        </div>
    )
}

let lastUpdate = new Date().getTime();

const debounceStorageUpdate = (data, callback) => {
    if(new Date().getTime() - lastUpdate >= 2500) {
        client
            .from('articles')
            .update(data)
            .eq('id', INDEX)
            .then(e => callback(e))

        lastUpdate = new Date().getTime();
    }else {
        setTimeout(() => debounceStorageUpdate(data, callback), 2500);
    }
}   