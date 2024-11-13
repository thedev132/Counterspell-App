import { SignedIn, SignedOut, useAuth, useOAuth, useUser  } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router'
import { Text, View, FlatList, TouchableOpacity } from 'react-native'
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import Modal from "react-native-modal";
import { Searchbar, TextInput } from 'react-native-paper';
import { readNdef, writeNdef } from '~/lib/nfc';
import User from '~/lib/user';
import { useEffect, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { handleSignOut, useWarmUpBrowser } from '~/lib/auth';
import Event from '~/lib/event';
import { Button } from "~/components/ui/button"

export default function Page() {
  const { user } = useUser()
  const { signOut, sessionId, getToken } = useAuth();

  const [isWriteModalVisible, setWriteModalVisible] = useState(false);
  const [isReadModalVisible, setReadModalVisible] = useState(false);
  const [isEventModalVisible, setEventModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [xpAmount, setXpAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });


  WebBrowser.maybeCompleteAuthSession();


   const useWarmUpBrowser = () => {
    useEffect(() => {
      WebBrowser.warmUpAsync();
      return () => {
        WebBrowser.coolDownAsync();
      };
    }, []);
  };
  useWarmUpBrowser();


 const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const onGooglePress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({redirectUrl: Linking.createURL('(home)/index')});
      console.log('OAuth success', createdSessionId);
      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });
        }
        router.replace('/');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, [startOAuthFlow]);

  const toggleWriteModal = async () => {
    if (!isWriteModalVisible) {
      await getUsers()
      setSearchQuery('')
    }
    setWriteModalVisible(!isWriteModalVisible);
  };

  const toggleReadModal = async () => {
    setReadModalVisible(!isReadModalVisible);
    if (!isReadModalVisible) {
      await readNdef()
    }
  };

  const toggleEventModal = async () => {
    if (!isWriteModalVisible) {
      await getEvents()
      setSearchQuery('')
      console.log(allEvents)
    }
    setEventModalVisible(!isEventModalVisible);
  };


  const personChosen = async (item: User) => {
    setSearchQuery(item.name)
    setSelectedUser(item.id)
  }

  const eventChosen = async (item: Event) => {
    setSearchQuery(item.name)
    setSelectedEvent(item.id)
  }

  const getUsers = async () => {
    if (!sessionId) {
      throw new Error('Session ID is null or undefined');
    }
    let token = await getToken({ sessionId });
    const response = await fetch('https://counterspell.byteatatime.dev/api/users', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      mode: 'cors'
    })

    const users = await response.json()
    let userList = []
    for (let user of users) {
      userList.push(new User(user.id, user.displayName, user.primaryEmail, user.imageUrl))
    }
    setAllUsers(userList)
  }

  const getEvents = async () => {
    if (!sessionId) {
      throw new Error('Session ID is null or undefined');
    }
    let token = await getToken({ sessionId });
    const response = await fetch('https://counterspell.byteatatime.dev/api/events', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      mode: 'cors'
    })

    const events = await response.json()
    let eventList = []
    for (let event of events) {
      eventList.push(new Event(event.id, event.name))
    }
    setAllEvents(eventList)
  }

  const markAttendance = async (eventID: string) => {
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
      toggleEventModal()
    }
  }

  const assignXP = async (userID: string) => {
    if (!sessionId) {
      throw new Error('Session ID is null or undefined');
    }
    let token = await getToken({ sessionId });
    const response = await fetch(`https://counterspell.byteatatime.dev/api/users/${userID}/xp`, {
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
      toggleReadModal()
    }
  }

  return (
    <SafeAreaView className='bg-[#1B1B1B] h-full'>
      <SignedIn>
        <View className='flex h-full'>
          <Text className='text-white text-2xl text-center my-10'>Hello {user?.fullName}!</Text>
          <View className='flex-grow'>
            <Button onPress={toggleReadModal}>
              <Text  className='text-white text-center p-5 mb-5 bg-green-600 rounded-[12] overflow-hidden mx-20'>Grant XP</Text>
            </Button>
            <Button onPress={toggleEventModal}>
              <Text  className='text-white text-center p-5 mb-5 bg-green-600 rounded-[12] overflow-hidden mx-20'>Event Attendace</Text>
            </Button>
            <Button onPress={toggleWriteModal}>
              <Text  className='text-white text-center p-5 mb-5 bg-red-600 rounded-[12] overflow-hidden mx-20'>Write NFC</Text>
            </Button>
          </View>
          
          <Button onPress={handleSignOut}>
            <Text className='text-white text-center p-5 bg-red-600 rounded-[12] overflow-hidden mx-20 mb-5'>Sign Out</Text>
          </Button>

          <Modal isVisible={isWriteModalVisible}>
            <View className='bg-[#1B1B1B] flex p-5 rounded-[12] shadow-lg shadow-black'>
              <Searchbar
                style={{marginHorizontal: 20, marginVertical: 10, height: 40}}
                inputStyle={{minHeight: 0}}
                placeholder="Search"
                onChangeText={setSearchQuery}
                value={searchQuery}
              />
              {allUsers.some(user => user.name.toLowerCase().includes(searchQuery.toLowerCase())) ? (
                <FlatList
                  style={{ minHeight: 0, maxHeight: '50%', flexGrow: 0 }}
                  scrollEnabled={true}
                  className='m-5'
                  data={allUsers.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                  renderItem={({item}) => (
                    <TouchableOpacity onPress={() => personChosen(item)}>
                      <Text className='py-2 text-white' numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.id}
                />
              ) : (
                <Text className='m-5 text-center text-white'>No results found</Text>
              )}
              <View className='flex flex-row items-center justify-around'>
                <TouchableOpacity onPress={toggleWriteModal}>
                  <Text className='text-white px-5 py-4 overflow-hidden bg-red-600 rounded-[12] mx-20'>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => {
                  await writeNdef(selectedUser);
                  setSearchQuery('');
                }}>
                  <Text className='text-white px-5 py-4 overflow-hidden bg-green-600 rounded-[12] mx-20'>Write NFC</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal isVisible={isReadModalVisible}>
            <View className='bg-[#1B1B1B] flex p-5 rounded-[12] shadow-lg shadow-black'>
              <View className='flex flex-row items-center justify-around'>
                <TextInput mode='outlined' style={{marginHorizontal: 20, marginVertical: 10, height: 40, minWidth: 'auto'}} placeholder="Assign XP Amount" keyboardType='phone-pad' onChangeText={(xpAmount) => setXpAmount(Number(xpAmount))}
 />
                <TouchableOpacity onPress={() => assignXP(selectedUser)}>
                  <Text className='text-white text-center px-5 py-4 overflow-hidden bg-green-600 rounded-[12] mx-5'>Assign XP</Text>
                </TouchableOpacity>
              </View>
              <TextInput mode='outlined' style={{marginHorizontal: 20, marginVertical: 10, height: 40}} placeholder="Reason" onChangeText={(reason) => setReason(reason)} />

                <TouchableOpacity onPress={toggleReadModal}>
                  <Text className='text-white text-center px-5 py-4 overflow-hidden bg-red-600 rounded-[12] mx-20 mt-5'>Cancel</Text>
                </TouchableOpacity>
            </View>
          </Modal>
          <Modal isVisible={isEventModalVisible}>
            <View className='bg-[#1B1B1B] flex p-5 rounded-[12] shadow-lg shadow-black'>
              <Searchbar
                style={{marginHorizontal: 20, marginVertical: 10, height: 40}}
                inputStyle={{minHeight: 0}}
                placeholder="Search"
                onChangeText={setSearchQuery}
                value={searchQuery}
              />
              {allEvents.some(event => event.name.toLowerCase().includes(searchQuery.toLowerCase())) ? (
                <FlatList
                  style={{ minHeight: 0, maxHeight: '50%', flexGrow: 0 }}
                  scrollEnabled={true}
                  className='m-5'
                  data={allEvents.filter(event => event.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                  renderItem={({item}) => (
                    <TouchableOpacity onPress={() => eventChosen(item)}>
                      <Text className='py-2 text-white' numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.id}
                />
              ) : (
                <Text className='m-5 text-center text-white'>No results found</Text>
              )}
              <View className='flex flex-row items-center justify-around'>
                <TouchableOpacity onPress={toggleEventModal}>
                  <Text className='text-white px-5 py-4 overflow-hidden bg-red-600 rounded-[12] mx-20'>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => markAttendance(selectedEvent)}>
                  <Text className='text-white px-5 py-4 overflow-hidden bg-green-600 rounded-[12] mx-20'>Mark Attendace</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </SignedIn>
      <SignedOut>
        <View className='flex h-full items-center justify-center'>
          <Text className='text-white text-2xl text-center my-10'>Welcome to the Counterspell App!</Text>
          <TouchableOpacity onPress={onGooglePress} >
            <Text className='text-white text-center p-5 px-20 text-md mb-5 bg-green-600 rounded-[12] overflow-hidden mx-20'>Sign In With Google</Text>
          </TouchableOpacity>
        </View>
      </SignedOut>
    </SafeAreaView>
  )
}
