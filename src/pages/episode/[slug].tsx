import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import api from '../../services/api';
import {format, parseISO} from 'date-fns';
import pt_BR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from '../../utfs/convertDurationToTimeString';
import styles from './episode.module.scss'
import { usePlayer } from '../../contexts/PlayerContext';

const ONE_DAY = 60 * 60 * 24;

type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    publishedAt: string;
    description: string;
    url: string;
    duration: number;
    durationAsString: string;
}

type EpisodeProps ={
    episode: Episode
}

export default function Episode ({episode}: EpisodeProps){
    const {play} = usePlayer();

    return (

        <div className={styles.episode}>
            <div className={styles.thumbnailContainer}>
            <Head>
                <title>Episode | Podcastr</title>
            </Head>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar"/>
                    </button>
                </Link>
                <Image 
                    width={700} 
                    height={160} 
                    src={episode.thumbnail} 
                    alt={episode.title}
                    objectFit="cover"
                />
                <button type="button" onClick={()=>{play(episode)}}>
                    <img src="/play.svg" alt="Tocar episódio"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>
            
            <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}}/>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const {data} = await api.get(`/episodes`, {
        params:{
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    });
    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    });
    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx)=>{
    const {slug} = ctx.params;
    const {data} = await api.get(`/episodes/${slug}`); 

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd/MM/yy', {locale: pt_BR}),
        description: data.description,
        url: data.file.url,
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration))
    }

    return {
        props: {episode},
        revalidate: ONE_DAY
    }
}