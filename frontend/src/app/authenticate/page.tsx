import SignIn from "@/components/Authenticate";
import config from "@/config";
import { IconBrandDiscordFilled, IconBrandGithubFilled, IconBrandLinkedin } from "@tabler/icons-react"
import Link from "next/link";

type GoogleUrl = {
    url: string
}

export default async function Authenticate() {
    const skewStyle = {
        transform: "skewX(-8deg) translateX(-20%) scaleX(1.2)"
    }

    const googleUrlData = await fetch(
        `${config.backendUrl}/auth/google/url`, 
        { cache: "no-cache" }
    );

    const googleUrl: GoogleUrl = await googleUrlData.json();

    return (
        <main className="w-full h-full flex bg-gray-100 -z-20">
            <div
                style={skewStyle} 
                className={`hidden lg:block absolute z-10 w-1/2 h-full bg-blue-500`}
            ></div>
            <div className="hidden lg:flex w-4/5 flex-col justify-between p-14 z-20">
                <div className="text-white text-2xl uppercase font-extrabold">
                    {/* Logo */}
                </div>
                <div className="text-white text-6xl font-extrabold mx-auto">
                    CodeConverse
                </div>
                <div className="mx-auto text-white flex gap-8">
                    <Link href={"https://github.com/achitJ"} target="_blank">
                        <IconBrandGithubFilled size={42}/>
                    </Link>
                    <Link href={"https://discordapp.com/users/779909577504063490"} target="_blank">
                        <IconBrandDiscordFilled size={42}/>
                    </Link>
                    <Link href={"https://www.linkedin.com/in/achitj/"} target="_blank">
                        <IconBrandLinkedin size={42}/>
                    </Link>
                </div>

            </div>
            <div className="w-full">
                <SignIn googleUrl={googleUrl.url} />
            </div>
        </main>
    )
}
