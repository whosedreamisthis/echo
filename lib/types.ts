export interface PostType {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
}
