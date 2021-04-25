import {GetStaticProps} from 'next';
import {format, parseISO} from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import pt_BR from 'date-fns/locale/pt-BR';
import api from '../services/api';
import { convertDurationToTimeString } from '../utfs/convertDurationToTimeString';

import styles from '../styles/home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';
type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    publishedAt: string;
    url: string;
    duration: number;
    durationAsString: string;
}
type HomeProps = {
  allEpisodes: Array<Episode>
  latestEpisodes: Array<Episode>
}

const EIGHT_HOURS = 60 * 60 * 8;

export default function Home({allEpisodes, latestEpisodes}: HomeProps) {
  const {playList} = usePlayer();
  const episodeList = [...latestEpisodes, ...allEpisodes]

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>
        <ul>
          {latestEpisodes.map((episode, index)=>{
            return(
              <li key={episode.id}>
                <Image 
                  width={192} 
                  height={192} 
                  src={episode.thumbnail} 
                  alt={episode.title} 
                  objectFit="cover"
                />
                <div className={styles.episodeDetails}>
                  <Link href={`/episode/${episode.id}`}>
                   <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>
                <button type="button" onClick={()=>{playList(episodeList, index)}}>
                  <img src="/play-green.svg" alt="Tocar Episodio"/>
                </button>
              </li>

            )
          })}
        </ul>
      </section>
      <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>

          <table cellSpacing={0}>
            <thead>
                <tr>
                  <th></th>
                  <th>Podcast</th>
                  <th>Integrantes</th>
                  <th>Data</th>
                  <th>Duração</th>
                  <th></th>
                </tr>
            </thead>
            <tbody>
              {allEpisodes.map((episode, index)=>{
                return (
                  <tr key={episode.id}>
                    <td style={{width:80}}>
                      <Image
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episode/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{width:100}}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button" onClick={()=>{playList(episodeList, index + latestEpisodes.length)}}>
                        <img src="/play-green.svg" alt="Tocar Episodio"/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </section>
    </div>
  )
}
export const getStaticProps: GetStaticProps = async () => {
  const {data} = await api.get('/episodes',{
    params:{
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map(episode=>{
    return{
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd/MM/yy', {locale: pt_BR}),
      description: episode.description,
      url: episode.file.url,
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration))
    }
  })

  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length);
  return {
    props: {
      allEpisodes,
      latestEpisodes,
    },
    revalidate: EIGHT_HOURS
  }
} 