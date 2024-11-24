import {View, Image, FlatList} from "react-native";
import {Text} from "~/components/ui/text";
import Modal from "react-native-modal";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle, DialogTrigger
} from "~/components/ui/dialog";
import {useEffect, useState} from "react";
import {Button} from "~/components/ui/button";
import {Input} from "~/components/ui/input";
import {useAuth} from "@clerk/clerk-expo";
import {readNdef} from "~/lib/nfc";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
export const InfoDialog = () => {
    const {getToken} = useAuth();
    const [selectedUser, setSelectedUser] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [avatarURL, setAvatarURL] = useState("");
    const [xp, setXP] = useState(0);
    const [prizes, setPrizes] = useState([]);
    const [events, setEvents] = useState([]);
    const [history, setHistory] = useState<{ xp: number, timestamp: string, reason: string }[]>([]);
    const [open, setOpen] = useState(false);

    return <Dialog open={open} onOpenChange={async isOpen => {
        if (isOpen) {
            const userId = await readNdef();
            console.log(userId)
            console.log(selectedUser)
            const response = await fetch(`https://counterspellsv.xyz/api/users/${userId}/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${await getToken()}`
                },
                mode: 'cors'
            });
            console.log(response)
            let data = await response.json();
            console.log(data)
            setDisplayName(data.displayName);
            setAvatarURL(data.avatar);
            setXP(data.xp != null ? Number(data.xp.xp) : 0);
            setPrizes(data.prizes);
            setEvents(data.attendedEvents);
    
        }


        setOpen(isOpen);
    }}>
        <DialogTrigger asChild>
            <View className="flex items-center justify-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md p-4 aspect-square">
                <Feather name="info" size={40} color="white" className="mb-5" />
                <Text className="text-white font-medium text-lg text-center">
                    Get Data
                </Text>
            </View>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Get Data</DialogTitle>
            </DialogHeader>

            <View className="flex items-center justify-center">
                <Image source={{uri: avatarURL}} style={{width: 50, height: 50, borderRadius: 25, marginBottom: 5}} />
                <Text className="text-lg font-medium">{displayName}</Text>
                <Text className="text-lg font-bold mb-5">XP: {xp}</Text>
                <Text className="text-lg font-medium">Event Attendance</Text>
                {
                    // history.map((entry, index) => (
                    //     <View key={index} className={`flex flex-row ${entry.xp > 0 ? "bg-green-500": "bg-red-500"} w-full px-5 py-2 justify-between rounded-lg mb-2`}>
                    //         <Text>{entry.reason}</Text>
                    //         <Text>{entry.xp}</Text>
                    //     </View>
                    // ))
                    events.map((event, index) => (
                        <View
                            key={index}
                            className="flex flex-row w-full px-5 py-2 items-center rounded-lg mb-2"
                        >
                            <Text className="text-start flex-1 mr-2 truncate">{event.name}</Text>
                            <Text className="text-end">{event.attended ? "✅" : "❌"}</Text>
                        </View>
                    ))
                }
            </View>

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">
                        <Text>Cancel</Text>
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}