import { useUserStore } from "@/stores/user";
import { useEffect } from "react";
import UserApi from "@/api/user";
import { useRouter } from 'next/navigation'

export default function useAuth() {
    const setUser = useUserStore(state => state.setUser);
    const logoutUser = useUserStore(state => state.logoutUser);
    const { push } = useRouter();

    useEffect(() => {
        UserApi.getUserDetails()
            .then((user) => {
                console.log(user);
                setUser(user);
            })
            .catch((err) => {
                console.log(err);
                logoutUser();
                push("/authenticate");
            });
    }, []);
}