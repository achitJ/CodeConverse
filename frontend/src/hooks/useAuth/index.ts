import { useUserStore } from "@/stores/user";
import { useEffect } from "react";
import UserApi from "@/api/user";

export default function useAuth() {
    const setUser = useUserStore(state => state.setUser);
    const logoutUser = useUserStore(state => state.logoutUser);

    useEffect(() => {
        console.log("useAuth");

        UserApi.getUserDetails()
            .then((user) => {
                console.log(user);
                setUser(user);
            })
            .catch((err) => {
                console.log(err);
                logoutUser();
            });
    }, []);
}