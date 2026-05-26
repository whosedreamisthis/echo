export interface PostType {
  _id: string;
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
  comments: {
    _id: string;
    userId: string; // Or an object if you populate it later
    content: string;
    createdAt: string;
  }[];
}
