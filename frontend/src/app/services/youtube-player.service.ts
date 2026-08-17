import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class YoutubePlayerService {
  private player: any = null;
  private isApiReady = false;
  private currentTimeout: any = null;
  private animFrameId: any = null;

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  public isPlaying$: Observable<boolean> = this.isPlayingSubject.asObservable();

  private playbackProgressSubject = new BehaviorSubject<number>(0); // 0 to 1
  public playbackProgress$: Observable<number> = this.playbackProgressSubject.asObservable();

  private isReadySubject = new BehaviorSubject<boolean>(false);
  public isReady$: Observable<boolean> = this.isReadySubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.initYouTubeIframeAPI();
  }

  private initYouTubeIframeAPI() {
    if (window.YT && window.YT.Player) {
      this.isApiReady = true;
      return;
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      this.ngZone.run(() => {
        this.isApiReady = true;
      });
    };
  }

  public createPlayer(elementId: string, videoId: string, startSeconds: number): Promise<void> {
    return new Promise((resolve) => {
      const init = () => {
        if (this.player) {
          try {
            this.player.destroy();
          } catch (e) {}
        }

        this.player = new window.YT.Player(elementId, {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            start: startSeconds,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: () => {
              this.ngZone.run(() => {
                this.isReadySubject.next(true);
                resolve();
              });
            },
            onStateChange: (event: any) => {
              this.ngZone.run(() => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  this.isPlayingSubject.next(true);
                } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                  this.isPlayingSubject.next(false);
                }
              });
            }
          }
        });
      };

      if (window.YT && window.YT.Player) {
        init();
      } else {
        const checkInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkInterval);
            init();
          }
        }, 100);
      }
    });
  }

  public cueVideo(videoId: string, startSeconds: number) {
    if (!this.player || !this.player.cueVideoById) return;
    this.stopSnippet();
    this.player.cueVideoById({
      videoId: videoId,
      startSeconds: startSeconds
    });
    this.playbackProgressSubject.next(0);
  }

  public playSnippet(startSeconds: number, durationSeconds: number) {
    if (!this.player) return;

    this.stopSnippet();

    try {
      this.player.seekTo(startSeconds, true);
      this.player.playVideo();
      this.isPlayingSubject.next(true);

      const startTime = performance.now();
      const totalDurationMs = durationSeconds * 1000;

      const trackProgress = () => {
        const elapsed = performance.now() - startTime;
        const fraction = Math.min(elapsed / totalDurationMs, 1);
        this.playbackProgressSubject.next(fraction);

        if (elapsed < totalDurationMs && this.isPlayingSubject.value) {
          this.animFrameId = requestAnimationFrame(trackProgress);
        }
      };
      this.animFrameId = requestAnimationFrame(trackProgress);

      this.currentTimeout = setTimeout(() => {
        this.ngZone.run(() => {
          if (this.player && this.player.pauseVideo) {
            this.player.pauseVideo();
          }
          this.isPlayingSubject.next(false);
          this.playbackProgressSubject.next(0);
        });
      }, totalDurationMs);
    } catch (err) {
      console.error('Error playing snippet:', err);
    }
  }

  public stopSnippet() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.player && this.player.pauseVideo) {
      try {
        this.player.pauseVideo();
      } catch (e) {}
    }
    this.isPlayingSubject.next(false);
    this.playbackProgressSubject.next(0);
  }
}
