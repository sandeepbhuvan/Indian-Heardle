import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Language,
  SongSearchItem,
  GameChallenge,
  GuessRequest,
  GuessResponse,
  RevealResponse
} from '../models/heardle.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.baseUrl}/catalog/languages`);
  }

  searchSongs(languageCode: string, query: string, limit = 20): Observable<SongSearchItem[]> {
    let params = new HttpParams()
      .set('language', languageCode)
      .set('q', query)
      .set('limit', limit.toString());
    return this.http.get<SongSearchItem[]>(`${this.baseUrl}/catalog/songs`, { params });
  }

  getDailyChallenge(languageCode: string): Observable<GameChallenge> {
    const params = new HttpParams().set('language', languageCode);
    return this.http.get<GameChallenge>(`${this.baseUrl}/game/daily`, { params });
  }

  getRandomChallenge(languageCode?: string): Observable<GameChallenge> {
    let params = new HttpParams();
    if (languageCode) {
      params = params.set('language', languageCode);
    }
    return this.http.get<GameChallenge>(`${this.baseUrl}/game/random`, { params });
  }

  submitGuess(payload: GuessRequest, isRandom = false): Observable<GuessResponse> {
    const params = new HttpParams().set('is_random', isRandom.toString());
    return this.http.post<GuessResponse>(`${this.baseUrl}/game/guess`, payload, { params });
  }

  revealSong(challengeId: number, isRandom = false): Observable<RevealResponse> {
    const params = new HttpParams().set('is_random', isRandom.toString());
    return this.http.get<RevealResponse>(`${this.baseUrl}/game/reveal/${challengeId}`, { params });
  }
}
