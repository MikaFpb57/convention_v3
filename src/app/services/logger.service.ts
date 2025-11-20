import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoggerService {

    /**
     * Logs an error message specifically for Web API failures.
     * In a real production app, this could send the log to a backend service (e.g., Sentry, Datadog, or a custom endpoint).
     * For now, it logs to the console with a specific prefix.
     */
    logWebApiError(message: string, error: any): void {
        const timestamp = new Date().toISOString();
        console.error(`[WEBAPI_ERROR] ${timestamp}: ${message}`, error);
        // TODO: Implement remote logging here if needed in the future
    }

    log(message: string): void {
        console.log(`[LOG]: ${message}`);
    }
}
