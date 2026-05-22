export interface FriendSuggestionDto {
  peopleId: number;
  userId: number;
  names: string;
  lastnames: string;
  mutualFriends: number;
  avatar?: string | null;
}

export interface SendFriendRequestDto {
  userId: number;
  institutionId: number;
  friendId: number;
  message: string;
}

export interface FriendConnectionItemDto {
  id: number;
  friendId: number;
  message: string;
  status: string;
  createdAt: string;
  friend: {
    peopleId: number;
    names: string;
    lastnames: string;
    avatar?: string | null;
  };
}

export interface FriendConnectionsDto {
  sent: FriendConnectionItemDto[];
  received: FriendConnectionItemDto[];
  friends: FriendConnectionItemDto[];
}
