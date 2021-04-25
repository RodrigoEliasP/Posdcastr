import { usePlayer } from '../../contexts/PlayerContext';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.scss';
import Slider, { Handle } from 'rc-slider';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utfs/convertDurationToTimeString';
export default function Player(){
    const {
        episodeList, 
        currentEpisodeIndex, 
        isPlaying, 
        isShuffling,
        isLooping,
        togglePlay,
        toggleShuffle,
        toggleLoop,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious
    } = usePlayer();
    const audioRef = useRef<HTMLAudioElement>(null);
    const episode = episodeList[currentEpisodeIndex];
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if(!audioRef.current){
            return;
        }
        if(isPlaying){
            audioRef.current.play();
        }else{
            audioRef.current.pause();
        }
    }, [isPlaying]);

    function setProgressListener(){
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', ()=>{
            setProgress(Math.floor(audioRef.current.currentTime))
        })
    }

    function handleSeek(amount: number){
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnd(){
        if(hasNext){
            playNext()
        }else{

        }
    }

    return(
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora</strong>
            </header>
            {episode ? (
                <div className={styles.currentEpisode}>
                    <Image 
                        width={592} 
                        height={592} 
                        src={episode.thumbnail} 
                        objectFit="cover"
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ): (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}
            
            <footer className={!episode? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{backgroundColor: '#04d361'}}
                                railStyle={{backgroundColor: '#9f75ff'}}
                                handleStyle={{borderColor: '#04d361', borderWidth: 4}}
                            />
                        ):(
                            <div className={styles.emptySlider}/>
                        )}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>
                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        onClick={toggleShuffle} 
                        className={isShuffling? styles.isActive: ''}
                        disabled={!episode || episodeList.length === 1}
                    >
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>
                    <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar Anterior"/>
                    </button>
                    <button type="button" className={styles.playButton} onClick={togglePlay} disabled={!episode}>
                        {
                            isPlaying ? (
                                <img src="/pause.svg" alt="Pausar"/>
                            ):(
                                <img src="/play.svg" alt="Tocar"/>
                            )
                        }
                    </button>
                    <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima" />
                    </button>
                    <button 
                        type="button" 
                        disabled={!episode}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}
                    >
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
                {episode && (
                    <audio 
                        src={episode.url} 
                        ref={audioRef} 
                        autoPlay
                        loop={isLooping}
                        onEnded={handleEpisodeEnd}
                        onLoadedMetadata={setProgressListener}
                        onPlay={()=>{setPlayingState(true)}}
                        onPause={()=>{setPlayingState(false)}}
                    />
                )}
                
            </footer>
        </div>
    );

    
}