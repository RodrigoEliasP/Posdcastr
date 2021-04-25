import {createContext, ReactNode, useContext, useState} from 'react'

type Episode = {
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    url: string;
}

type PlayerContextData = {
    episodeList: Array<Episode>;
    isPlaying: boolean;
    isLooping: boolean;
    isShuffling: boolean
    currentEpisodeIndex: number;
    play: (episode: Episode) => void,
    togglePlay: () => void,
    toggleLoop: () => void,
    toggleShuffle: () => void,
    setPlayingState: (state: boolean) => void;
    playList: (list: Array<Episode>, index: number) => void,
    playNext: () => void,
    playPrevious: () => void,
    clearPlayerState: () => void,
    hasPrevious: boolean,
    hasNext: boolean
}

type PlayerContextProvider = {
    children: ReactNode;
}

export const PlayerContext = createContext({} as PlayerContextData);

export function PlayerContextProvider({children}: PlayerContextProvider){
    const [episodeList, setEpisodeList] = useState([]);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    function play (episode: Episode){
        setEpisodeList([episode]);
        setCurrentEpisodeIndex(0);
        setIsPlaying(true);
    }

    function playList(list: Array<Episode>, index: number){
        setEpisodeList(list);
        setCurrentEpisodeIndex(index);
        setIsPlaying(true);
    }

    function togglePlay(){
        setIsPlaying(!isPlaying);
    }

    function toggleLoop(){
        setIsLooping(!isLooping);
    }
    function toggleShuffle(){
        setIsShuffling(!isShuffling);
    }

    function setPlayingState(state: boolean){
        setIsPlaying(state);
    }
    const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length
    const hasPrevious = currentEpisodeIndex > 0;

    function playNext(){
        if(isShuffling){
            const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length)
            setCurrentEpisodeIndex(nextRandomEpisodeIndex)
        }else if (hasNext) {
            setCurrentEpisodeIndex(currentEpisodeIndex +1);
        }
    }
    function playPrevious(){
        if(hasPrevious){
            setCurrentEpisodeIndex(currentEpisodeIndex -1);
        }
    }
    function clearPlayerState(){
        setEpisodeList([]);
        setCurrentEpisodeIndex(0);
    }

    return (
        <PlayerContext.Provider value={{
            episodeList, 
            isPlaying, 
            isLooping,
            isShuffling,
            currentEpisodeIndex, 
            play, 
            togglePlay, 
            toggleLoop,
            toggleShuffle,
            setPlayingState,
            playList,
            playNext,
            playPrevious,
            clearPlayerState,
            hasPrevious,
            hasNext
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => useContext(PlayerContext);