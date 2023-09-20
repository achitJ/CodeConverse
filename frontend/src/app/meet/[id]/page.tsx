import Room from "@/components/Room"

export default function MeetRoom({ params }: { params: { id: string } }) {

    return (
        <div className="w-screen h-full bg-gray-100">
            <Room id={params.id}/>
        </div>
    );
}