import {FlatList, TouchableOpacity, View} from "react-native";
import {Searchbar} from "react-native-paper";
import {Text} from "~/components/ui/text";
import {writeNdef} from "~/lib/nfc";
import Modal from "react-native-modal";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import User from "~/lib/user";
import {useState} from "react";
import {Button} from "~/components/ui/button";
import {Input} from "~/components/ui/input";

export const WriteNfcDialog = ({users}: { users: User[] }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState("")

    return <Dialog>
        <DialogTrigger asChild>
            <Button variant='outline'>
                <Text>Write NFC</Text>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Write NFC</DialogTitle>
            </DialogHeader>

            <Input
                placeholder="Search..."
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
            {users.some(user => user.name.toLowerCase().includes(searchQuery.toLowerCase())) ? (
                <FlatList
                    style={{minHeight: 0, maxHeight: '50%', flexGrow: 0}}
                    scrollEnabled={true}
                    data={users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                    renderItem={({item}) => (
                        <Button onPress={() => {
                            setSearchQuery(item.name)
                            setSelectedUser(item.id)
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
                    <Button>
                        <Text>Cancel</Text>
                    </Button>
                </DialogClose>
                <Button onPress={async () => {
                    await writeNdef(selectedUser);
                    setSearchQuery('');
                }}>
                    <Text>Write NFC</Text>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}