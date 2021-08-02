
import Head from 'next/head'
import Router from 'next/router'

import styles from '@styles/Home.module.css'

import Header from '@components/header'
import Button from '@components/button'
import Footer from '@components/footer'
import { useEffect, useState } from 'react'
import client from '@components/client'
import Article from '@components/article_cover'
import Link from 'next/link'

import dynamic from "next/dynamic"

const NoSSRComponent = dynamic(() => import("@components/article_cover"), {
	ssr: false,
});

export async function getServerSideProps() {
	return {
		props: {
			some_data: await client
						.from('articles')
						.select()
						.eq('published', true)
						.limit(25)
						.then(e => e.data)
		}
	}
}

export default function Home({ some_data }) { // { some_data }
	// if(!process.browser) return <div></div>
	const [ data, setData ] = useState(some_data);

	// useEffect(() => {
	// 	client
	// 	.from('articles')
	// 	.select()
	// 	.eq('published', true)
	// 	.limit(25)
	// 	.then(e => {
	// 		setData(e.data)
	// 	});
		
	// }, []);

	return (
		<div className={styles.container}>
			<Header title={"Home"} type={"user"}/>
		
			<div className={styles.mainBodyBody}>
				<div className={styles.homeArt}><img src="../art.svg" alt="" /></div>
				<section className={`${styles.homeSection} ${styles.mainHomeSection}`}>
					<div>
						<h1>Fly New <br/>Zealand</h1>
						<p>Learn better financing with us, wherever you are</p>

						{/* <Button title={"Get Started"} router={Router} onClick={(e, callback) => {
							callback();
						}}></Button> */}
					</div>

					<div>
						<img src={'../plane.png'}></img>
					</div>
				</section>

				<section className={styles.articlesList}>
					{	
						data?.map(e => {
							return (
								<NoSSRComponent key={`K-${e.id}`} title={e.title} tags={e.tags} image={e.background_image} desc={e.description} size={0} redirect={e.id}/>
							)
						})
					}
				</section>
			</div>  

			<Footer />  
		</div>
	)
}

