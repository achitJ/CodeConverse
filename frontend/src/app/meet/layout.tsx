import SocketProvider from "@/contexts/Socket"

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <section className="w-full h-full">
            <SocketProvider>
                {children}
            </SocketProvider>
        </section>
    )
}