export class SessionIdService {
  private sessionIdKey = 'sessionId';

  get(): string | boolean {
    const sessionId = localStorage.getItem(this.sessionIdKey);
    if (sessionId) {
      return sessionId;
    }
    return false;
  }

  set(sessionId: string): void {
    localStorage.setItem(this.sessionIdKey, sessionId);
  }

  delete() {
    localStorage.removeItem(this.sessionIdKey);
  }
}
