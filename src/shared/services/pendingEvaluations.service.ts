export interface PendingEvaluationsData {
  required: number;
  optional: number;
  total: number;
}

export class PendingEvaluationsService {
  private key = 'pendingEvaluations';

  get(): PendingEvaluationsData | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  set(data: PendingEvaluationsData) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  hasRequiredPending(): boolean {
    const data = this.get();
    return !!data && data.required > 0;
  }

  isStudent(): boolean {
    return localStorage.getItem('profileId') === '2';
  }
}
