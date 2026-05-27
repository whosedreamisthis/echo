import { create } from "zustand";
import { PostType } from "@/lib/types";

interface PostState {
  ancestors: PostType[];
  pushToAncestors: (post: PostType) => void;
  popFromAncestors: () => void;
  setAncestors: (ancestors: PostType[]) => void;
}

export const usePostStore = create<PostState>((set) => ({
  ancestors: [],
  pushToAncestors: (post) =>
    set((state) => ({ ancestors: [...state.ancestors, post] })),
  popFromAncestors: () =>
    set((state) => ({ ancestors: state.ancestors.slice(0, -1) })),
  setAncestors: (ancestors) => set({ ancestors }),
}));
