import {FlatList, View} from "react-native";
import {Text} from "~/components/ui/text";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle, DialogTrigger
} from "~/components/ui/dialog";
import {useState} from "react";
import {Button} from "~/components/ui/button";
import {Input} from "~/components/ui/input";
import Event from "~/lib/event"; // Import your Event type

export const EventAttendanceDialog = ({events}: { events: Event[] }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);


    const markAttendance = async () => {
        if (!selectedEvent) return; // Or handle the case where no event is selected

        // Your markAttendance logic here, using selectedEvent
        console.log("Marking attendance for event:", selectedEvent);
        // Close the dialog after marking attendance
    }

    return <Dialog>
        <DialogTrigger asChild>
            <Button variant='outline'>
                <Text>Event Attendance</Text>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Event Attendance</DialogTitle>
            </DialogHeader>

            <Input
                placeholder="Search..."
                onChangeText={setSearchQuery}
                value={searchQuery}
            />

            {events.some(event => event.name.toLowerCase().includes(searchQuery.toLowerCase())) ? (
                <FlatList
                    style={{minHeight: 0, maxHeight: '50%', flexGrow: 0}}
                    scrollEnabled={true}
                    data={events.filter(event => event.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                    renderItem={({item}) => (
                        <Button onPress={() => {
                            setSearchQuery(item.name);
                            setSelectedEvent(item.id);
                        }} variant="outline" className="my-1">
                            <Text numberOfLines={1}>{item.name}</Text>
                        </Button>
                    )}
                    keyExtractor={item => item.id}
                />
            ) : (
                <Text>No results found</Text>
            )}

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">
                        <Text>Cancel</Text>
                    </Button>
                </DialogClose>
                <Button onPress={markAttendance} disabled={!selectedEvent}>
                    <Text>Mark Attendance</Text>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}