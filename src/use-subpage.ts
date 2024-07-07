import { create } from "zustand";

export enum SUBPAGE {
  READ,
  WRITE,
}

export type UseSubpage = {
  value: SUBPAGE;
  set(this: void, subpage: SUBPAGE): void;
};

export const useSubpage = create<UseSubpage>((set) => {
  return {
    value: SUBPAGE.WRITE,
    set: (subpage: SUBPAGE) => {
      set({ value: subpage });
    },
  };
});
