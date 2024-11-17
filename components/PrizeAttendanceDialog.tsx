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
import { useAuth } from "@clerk/clerk-expo";
import { readNdef } from "~/lib/nfc";
import Prize from "~/lib/prize";

export const PrizeAttendanceDialog = ({prizes}: { prizes: Prize[] }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
    const { sessionId, getToken } = useAuth();
    const [selectedUser, setSelectedUser] = useState("");
    const [open, setOpen] = useState(false);

    const spendPrize = async () => {
        if (!selectedPrize) return; // Or handle the case where no prize is selected

        // Your spendPrize logic here, using selectedPrize
        if (!sessionId) {
            throw new Error('Session ID is null or undefined');
          }
          let token = await getToken({ sessionId });
          const response = await fetch(`https://counterspell.byteatatime.dev/api/users/${selectedUser}/prize?prizeId=${selectedPrize}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            mode: 'cors'
          })
      
          if (response.ok) {
            setOpen(false)
          }
        console.log("Spending prize:", selectedPrize);
        // Close the dialog after spending prize
    }

    
    return <Dialog open={open} onOpenChange={async isOpen => {
        if (isOpen) {
            const userId = await readNdef();
            setSelectedUser(userId);
        }
        setOpen(isOpen);
    }}>
        <DialogTrigger asChild>
            <Button variant='outline'>
                <Text>Buy Prize </Text>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Buy Prize</DialogTitle>
            </DialogHeader>

            <Input
                placeholder="Search..."
                onChangeText={setSearchQuery}
                value={searchQuery}
            />

            {prizes.some(prize => prize.name.toLowerCase().includes(searchQuery.toLowerCase())) ? (
                <FlatList
                    style={{minHeight: 0, maxHeight: '50%', flexGrow: 0}}
                    scrollEnabled={true}
                    data={prizes.filter(prize => prize.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                    renderItem={({item}) => (
                        <Button onPress={() => {
                            setSearchQuery(item.name);
                            setSelectedPrize(item.id);
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
                <Button onPress={spendPrize} disabled={!selectedPrize}>
                    <Text>Buy Prize</Text>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}