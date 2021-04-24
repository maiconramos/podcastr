import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import { usePlayer } from '../../contexts/PlayerContext';
import Episode from '../../pages/episodes/[slug]';
import styles from './styles.module.scss'; 
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {

    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress , setProgress] = useState(0);

    const { 
        episodeList, 
        currentEpisodeIndex , 
        play , 
        isPlaying,
        isLooping,
        isShuffling,
        playNext,
        playPrevious,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        hasNext,
        hasPrevious,
        clearPlayerState,
        setPlayingState,
     } = usePlayer();

     useEffect(() => {
         if(!audioRef.current){
             return;
         }
         if (isPlaying) {
             audioRef.current.play();
         } else {
            audioRef.current.pause();
         }
     }, [isPlaying])

     function setupProgressListener (){
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate' , () => {
            setProgress(Math.floor(audioRef.current.currentTime))
        })
     }

     function handleEpisodeEnded() {
        if (hasNext) {
            playNext();
        } else {
            clearPlayerState()
        }
     }

     function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount)
     }

    const episode = episodeList[currentEpisodeIndex];


    return (
       <div className={styles.playerContainer}>
           <header>
               <img src="/playing.svg" alt="Tocando Agora"/>
               <strong>Tocando agora!</strong>
           </header>

          { episode ? (
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
          ) : (
            <div className={styles.emptyPlayer}>
                <strong>Selecione um podcast para ouvir</strong>
            </div>
          ) }

           <footer className={!episode ? styles.empty : ''}>
               <div className={styles.progress}>
               <span>{convertDurationToTimeString(progress)}</span>
                   <div className={styles.slider}>
                       { episode ? (
                           <Slider
                            max={episode.duration}
                            value={progress}
                            onChange={handleSeek}
                            trackStyle={{ backgroundColor: '#04d361' }}
                            railStyle={{ backgroundColor: '#9f75ff'}}
                            handleStyle={{ borderColor: '#04d361' , borderWidth: 4 }}
                           />
                       ) : (
                        <div className={styles.emptySlider} />
                       )}
                        
                   </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
               </div>

                {episode && (
                    <audio
                     src={episode.url}
                     ref={audioRef}
                     autoPlay
                     onEnded={handleEpisodeEnded}
                     loop={isLooping}
                     onPlay={ () => setPlayingState(true)}
                     onPause={ () => setPlayingState(false)}
                     onLoadedMetadata={setupProgressListener}
                     />
                )}

               <div className={styles.buttons}>
                   <button 
                    type="button" 
                    disabled={!episode || episodeList.length === 1}
                    onClick={toggleShuffle}
                    className={isShuffling ? styles.isActive : ''}
                  >
                       <img src="/shuffle.svg" alt="Embaralhar"/>
                   </button>
                   <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                       <img src="/play-previous.svg" alt="Tocar Anterior"/>
                   </button>
                   <button 
                    type="button" 
                    className={styles.playButton} 
                    disabled={!episode}
                    onClick={togglePlay}
                    >
                       <img src={ isPlaying ? ("/pause.svg") : ("/play.svg")} alt={ isPlaying ? ("Pausar") : ("Tocar")}/>
                   </button>
                   <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                       <img src="/play-next.svg" alt="Tocar Próxima"/>
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
           </footer>
       </div>
    )
} 