import Form from "./Form";

export default function SignIn({googleUrl}: {googleUrl: string}) {
    return (
        <div className="w-11/12 lg:w-3/5 h-full flex flex-col justify-center mx-auto">
            <div className="font-bold text-4xl">
                Sign In
            </div>
            <div className="text-md mt-3">
                Sign in to your account
            </div>
            <Form googleUrl={googleUrl}/>
        </div>
    )
}