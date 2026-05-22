// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia';
import { UserInstitutionDto } from '../shared/dto/userInstitution.dto';
import { UserRoleDto } from '../shared/dto/userRole.dto';
import { UserDto } from '../shared/dto/user.dto';
import { LanguageDto } from '../shared/dto/language.dto';
import { ItemMenuType } from '../shared/types/itemMenu.type';

/**
 * Simulate a login
 */
function apiLogin(a: string, p: string) {
  if (a === 'ed' && p === 'ed') return Promise.resolve({ isAdmin: true });
  if (p === 'ed') return Promise.resolve({ isAdmin: false });
  return Promise.reject(new Error('invalid credentials'));
}

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    userInstitutions: [] as UserInstitutionDto[],
    userRoles: [] as UserRoleDto[],
    items: [] as ItemMenuType[],
    user: {} as UserDto,
    languages: [] as LanguageDto[],
    name: 'Eduardo',
    isAdmin: true,
  }),

  actions: {
    logout() {
      this.$patch({
        name: '',
        isAdmin: false,
      });

      // we could do other stuff like redirecting the user
    },

    /**
     * Attempt to login a user
     */
    async login(user: string, password: string) {
      const userData = await apiLogin(user, password);

      this.$patch({
        name: user,
        ...userData,
      });
    },
    async setItemsMenu(newItems: ItemMenuType[]) {
      this.$patch({
        items: newItems,
      });
    },
    async setUserDto(newItems: UserDto) {
      this.$patch({
        user: newItems,
      });
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
