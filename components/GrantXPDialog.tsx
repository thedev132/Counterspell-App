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
import {readNdef} from "~/lib/nfc";

export const GrantXPDialog = () => {
    const [xpAmount, setXpAmount] = useState(0);
    const [reason, setReason] = useState("");
    const {getToken} = useAuth();
    const [selectedUser, setSelectedUser] = useState("");

    const [open, setOpen] = useState(false);

    const grantXP = async () => {
        let token = await getToken();
        const response = await fetch(`https://counterspell.byteatatime.dev/api/users/${selectedUser}/xp`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: xpAmount,
                reason: reason
            }),
            mode: 'cors'
        })

        if (response.ok) {
            setOpen(false)
        }
    }


    return <Dialog open={open} onOpenChange={async isOpen => {
        if (isOpen) {
            const userId = await readNdef();
            setSelectedUser(userId);
        }
    }}>
        <DialogTrigger asChild>
            <Button variant='outline'>
                <Text>Grant XP</Text>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Grant XP</DialogTitle>
            </DialogHeader>

            <View className="flex flex-row items-center">
                <Input
                    placeholder="XP Amount"
                    keyboardType='numeric'
                    onChangeText={(xpAmount) => setXpAmount(Number(xpAmount))}
                    className="flex-1"
                />
                <Button onPress={() => grantXP()} variant="outline" className="ml-2">
                    <Text>Grant!</Text>
                </Button>
            </View>

            <Input
                placeholder="Reason"
                onChangeText={(reason) => setReason(reason)}
                className="mt-2" // Add some margin for spacing
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