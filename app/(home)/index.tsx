import { SignedIn, SignedOut, useAuth, useOAuth, useUser  } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router'
import { View, FlatList, TouchableOpacity } from 'react-native'
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
import { Text } from "~/components/ui/text"
import {WriteNfcDialog} from "~/components/WriteNfcDialog";
import {GrantXPDialog} from "~/components/GrantXPDialog";
import {EventAttendanceDialog} from "~/components/EventAttendanceDialog";

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
    <SafeAreaView>
      <SignedIn>
        <View className='flex h-full'>
          <Text className='text-white text-2xl text-center my-10'>Hello {user?.fullName}!</Text>
          <View className='flex-grow'>
              <WriteNfcDialog users={allUsers} />
              <GrantXPDialog />
                <EventAttendanceDialog events={allEvents} />
          </View>
          
          <Button onPress={handleSignOut}>
            <Text>Sign Out</Text>
          </Button>
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
