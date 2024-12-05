import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StoreKeyRequest {
  token: string;
  hashedKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
  private baseUrl = 'https://localhost:7018/api/ApiKey';

  constructor(private http: HttpClient) { }

  requestLink(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/request-link`, JSON.stringify(email), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  verifyLink(token: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/verify-link`, JSON.stringify(token), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  storeKey(request: StoreKeyRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/store-key`, request);
  }
}
