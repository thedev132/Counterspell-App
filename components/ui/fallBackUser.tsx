import { FlatList, TouchableOpacity, View } from "react-native";
import { Searchbar } from "react-native-paper";
import { Text } from "~/components/ui/text";
import User from "~/lib/user";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "./input";

export const Fallback = ({
  users,
  selectedUser,
  onChangeSelectedUser,
}: {
  users: User[];
  selectedUser: string;
  onChangeSelectedUser: (userId: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View>
        <Input
            placeholder="Search..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            className="mb-5"
        />
      {users.some((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ? (
        <FlatList
          style={{ minHeight: 0, maxHeight: "75%", flexGrow: 0 }}
          scrollEnabled={true}
          data={users.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          renderItem={({ item }) => (
            <Button
              onPress={() => {
                setSearchQuery(item.name);
                onChangeSelectedUser(item.id);
              }}
              variant="outline"
              className="my-1"
            >
              <Text numberOfLines={1}>{item.name}</Text>
            </Button>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text>No results found</Text>
      )}
    </View>
  );
};
