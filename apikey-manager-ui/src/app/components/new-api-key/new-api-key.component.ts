import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiKeyService } from '../../services/api-key.service';
import * as bcryptjs from 'bcryptjs';

@Component({
  selector: 'app-new-api-key',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './new-api-key.component.html',
  styleUrl: './new-api-key.component.css'
})
export class NewApiKeyComponent implements OnInit {
  isLoading = true;
  isGenerating = false;
  token: string | null = null;
  apiKey: string | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiKeyService: ApiKeyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = 'Invalid or missing token';
      this.isLoading = false;
      return;
    }

    this.verifyToken();
  }

  private verifyToken(): void {
    this.apiKeyService.verifyLink(this.token!).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error verifying token:', error);
        this.error = 'Invalid or expired token';
        this.isLoading = false;
      }
    });
  }

  generateApiKey(): void {
    this.isGenerating = true;
    // Generate a new GUID for the API key
    const newApiKey = crypto.randomUUID();
    this.apiKey = newApiKey;

    // Hash the API key using bcrypt
    bcryptjs.genSalt(10, (err, salt) => {
      if (err) {
        this.handleError('Error generating salt');
        return;
      }

      bcryptjs.hash(newApiKey, salt, (err, hash) => {
        if (err) {
          this.handleError('Error hashing API key');
          return;
        }

        this.storeHashedKey(hash);
      });
    });
  }

  private storeHashedKey(hashedKey: string): void {
    this.apiKeyService.storeKey({ token: this.token!, hashedKey }).subscribe({
      next: () => {
        this.isGenerating = false;
        this.snackBar.open('API key generated successfully!', 'Close', { duration: 5000 });
      },
      error: (error) => {
        console.error('Error storing API key:', error);
        this.handleError('Error storing API key');
      }
    });
  }

  private handleError(message: string): void {
    this.error = message;
    this.isGenerating = false;
    this.apiKey = null;
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  copyToClipboard(): void {
    if (this.apiKey) {
      navigator.clipboard.writeText(this.apiKey).then(
        () => this.snackBar.open('API key copied to clipboard!', 'Close', { duration: 3000 }),
        () => this.snackBar.open('Failed to copy API key', 'Close', { duration: 3000 })
      );
    }
  }
}
