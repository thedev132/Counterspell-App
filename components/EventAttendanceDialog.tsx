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
import { useAuth } from "@clerk/clerk-expo";
import { readNdef } from "~/lib/nfc";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const EventAttendanceDialog = ({events}: { events: Event[] }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const { sessionId, getToken } = useAuth();
    const [open, setOpen] = useState(false);

    const markAttendance = async () => {
        if (!selectedEvent) return; // Or handle the case where no event is selected

        // Your markAttendance logic here, using selectedEvent
        if (!sessionId) {
            throw new Error('Session ID is null or undefined');
          }
          let token = await getToken({ sessionId });
          let userID = await readNdef()
          const response = await fetch(`https://counterspell.byteatatime.dev/api/users/${userID}/event?eventId=${eventID}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            mode: 'cors'
          })
      
          if (response.ok) {
            setOpen(false)
          }
        console.log("Marking attendance for event:", selectedEvent);
        // Close the dialog after marking attendance
    }

    
    return <Dialog open={open} onOpenChange={async isOpen => {
        setOpen(isOpen);
    }}>
        <DialogTrigger asChild >
        <View className="flex items-center justify-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md p-4 aspect-square">
            <MaterialIcons name="event-available" size={40} color="white" className="mb-5"/>
            <Text className="text-white font-medium text-lg text-center">
                Event Attendance
            </Text>
        </View>

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