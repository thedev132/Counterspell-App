import {View} from "react-native";
import {Text} from "~/components/ui/text";
import Modal from "react-native-modal";
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
import {useAuth} from "@clerk/clerk-expo";
import {createHuntTag, readNdef, writeNdef} from "~/lib/nfc";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export const HuntsDialog = () => {
    const [xpAmount, setXpAmount] = useState(0);
    const [location, setLocation] = useState("");
    const {getToken} = useAuth();

    const [open, setOpen] = useState(false);

    const createHunt = async () => {
        let token = await getToken();
        const response = await fetch('https://counterspellsv.xyz/api/hunts', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                xp: xpAmount,
                location: location,
                isActive: true
            }),
            mode: 'cors'
        })


        const responseData = await response.json();
        console.log(responseData.id)
        let status = await createHuntTag(responseData.id);

        if (response.ok && status) {
            setOpen(false)
        }
    }


    return <Dialog open={open} onOpenChange={async isOpen => {
        setOpen(isOpen);
    }}>
        <DialogTrigger asChild>
            <View className="flex items-center justify-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md p-4 aspect-square">
                <FontAwesome6 name="magnifying-glass" size={36} color="white" className="mb-5" />
                <Text className="text-white font-medium text-lg text-center">
                    Create Hunt
                </Text>
            </View>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create Scavanger Hunt</DialogTitle>
            </DialogHeader>

            <View className="flex flex-row items-center">
                <Input
                    placeholder="XP Amount"
                    keyboardType='numeric'
                    onChangeText={(xpAmount) => setXpAmount(Number(xpAmount))}
                    className="flex-1"
                />
                <Button onPress={async () => await createHunt()} variant="outline" className="ml-2">
                    <Text>Create</Text>
                </Button>
            </View>

            <Input
                placeholder="Location"
                onChangeText={(reason) => setLocation(reason)}
                className="mt-2" 
            />

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