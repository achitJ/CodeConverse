"use client"

import { IconBrandGoogle } from "@tabler/icons-react"
import { AuthInput } from "@/common/Input"
import { useState } from "react";
import Link from "next/link";

export default function Form({googleUrl}: {googleUrl: string}) {
    // const { data: session } = useSession();

    // useEffect(() => {
    //     if (session) {
    //         window.location.href = "/dashboard"
    //     }
    // }, [session]);

    const [type, setType] = useState<"signin" | "register">("signin");

    return (
        <form className="w-full mt-10 flex flex-col gap-6">
            <div className="flex gap-4">
                <Link 
                    className="w-full flex justify-center gap-2 cursor-pointer bg-white rounded-lg py-3 px-4"
                    href={googleUrl}
                >
                    <IconBrandGoogle size={16} />
                    <div className="text-xs opacity-60">
                        {type === "signin" ? "Sign in with Google" : "Sign up with Google"}
                    </div>
                </Link>
            </div>
            <div className="w-full p-8 bg-white rounded-lg">
                {
                    type === "register" ?
                    <AuthInput
                        label="Name"
                        placeholder="Enter your name"
                    />: null
                }
                <AuthInput
                    label="Email"
                    placeholder="Enter your email"
                />
                <AuthInput
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                />
                {/* <div className="text-sm text-blue-500 hover:underline cursor-pointer">
                    Forgot password?
                </div> */}
                <button className="bg-blue-500 hover:bg-blue-600 w-full mt-3 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline" type="button">
                    {(type === "register") ? "Sign Up" : "Sign In"}
                </button>
            </div>
            {
                type === "signin" ?
                <div className="text-sm text-gray-500 mx-auto">
                    {"Don't have an account? "} 
                    <span 
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={() => setType("register")}
                    >
                        Register Here
                    </span>
                </div> : 
                <div className="text-sm text-gray-500 mx-auto">
                    {"Already have an account? "} 
                    <span 
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={() => setType("signin")}
                    >
                        LogIn Here
                    </span>
                </div>
            }
        </form>
    )
}