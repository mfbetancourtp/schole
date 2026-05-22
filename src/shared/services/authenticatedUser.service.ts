import { UserDto } from '../dto/user.dto';
import AuthenticatedUserStore from '../stores/authenticatedUser.store';

export class AuthenticatedUserService {
  private key = 'user';

  get(): UserDto | null {
    const user = localStorage.getItem(this.key);

    if (user) {
      return JSON.parse(user);
    }

    return null;
  }

  set(user: any): void {
    localStorage.setItem(this.key, JSON.stringify(user));
    this.setOnStore();
  }

  setOnStore() {
    const user = this.get();

    if (user) {
      AuthenticatedUserStore.methods.set(user);
    }
  }
}