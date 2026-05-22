import {Observable, ReplaySubject} from 'rxjs';

export class SetCurrentStudentParentService {
    private _userId: ReplaySubject<number> = new ReplaySubject<number>(1);
    private localStorageKey = 'currentStudentParentUserId';

    set userId(value: number) {
        this._userId.next(value);
    }

    get userId$(): Observable<number> {
        // console.log(this._userId.asObservable());
        return this._userId.asObservable();
    }

    get(): number | boolean {
        const userId = localStorage.getItem(this.localStorageKey);

        if (userId) {
            return parseInt(userId);
        }

        return false;
    }

    set(userId: number): void {
        localStorage.setItem(this.localStorageKey, `${userId}`);
    }

    delete() {
        localStorage.removeItem(this.localStorageKey);
    }
}