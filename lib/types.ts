export interface CommentUserType {
  _id: string;
  username: string;
  profilePicture: string | null;
}

// The clean, serialized comment data sent to your Client Components
export interface CommentType {
  _id: string;
  content: string;
  createdAt: string; // ISO string representation from serialization
  user: CommentUserType | null; // Nullable in case the user deleted their account
}

export interface PostType {
  _id: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  likes: string[]; // Array of User IDs who liked
  reposts: string[]; // Array of User IDs who reposted
  shares: string[]; // Array of User IDs who shared
  commentCount: number;
  comments?: PostType[];
}
