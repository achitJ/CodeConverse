import { create } from "zustand";

type UserState = {
    name: string;
    email: string;
    _id: string;
    isAdmin: boolean;
    isGoogleUser: boolean;
}

type UserActions = {
    setUser: (user: UserState) => void;
    logoutUser: () => void;
}

const initialState: UserState = {
    name: '',
    email: '',
    _id: '',
    isAdmin: false,
    isGoogleUser: false
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
    ...initialState,
    setUser: (user: UserState) => set(user),
    logoutUser: () => set(initialState)
}));