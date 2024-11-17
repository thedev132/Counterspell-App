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
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import Prize from '~/lib/prize';
import { PrizeAttendanceDialog } from '~/components/PrizeAttendanceDialog';

export default function Page() {
  const { user } = useUser()
  const { signOut, sessionId, getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allPrizes, setAllPrizes] = useState<Prize[]>([]);
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

  useEffect(() => {
    getUsers()
    getEvents()
    getPrizes()
  })

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

  const getPrizes = async () => {
    if (!sessionId) {
      throw new Error('Session ID is null or undefined');
    }
    let token = await getToken({ sessionId });
    const response = await fetch('https://counterspell.byteatatime.dev/api/prizes', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      mode: 'cors'
    })

    const prizes = await response.json()
    let prizeList = []
    for (let prize of prizes) {
      prizeList.push(new Prize(prize.id, prize.name, prize.cost, prize.stock))
    }
    setAllPrizes(prizeList)
    console.log(prizeList)
  }


  return (
    <SafeAreaView>
      <SignedIn>
        <View className='flex h-full'>
          <Text className='text-white text-2xl text-center my-10'>Hello {user?.fullName}!</Text>
          <View className='flex-grow px-10 gap-5'>
              <WriteNfcDialog users={allUsers} />
              <GrantXPDialog />
              <EventAttendanceDialog events={allEvents} />
              <PrizeAttendanceDialog prizes={allPrizes} />
          </View>
          
          <Button onPress={handleSignOut} className='mx-10 mb-5'>
            <Text>Sign Out</Text>
          </Button>
        </View>
      </SignedIn>
      <SignedOut>
        <View className='flex h-full items-center justify-center'>
          <Text className='text-white text-2xl text-center my-10'>Welcome to the Counterspell App!</Text>
          <TouchableOpacity onPress={onGooglePress}  >
            <Text className='text-white text-center p-5 px-20 text-md mb-5 bg-green-600 rounded-[12] overflow-hidden mx-20'>Sign In With Google</Text>
          </TouchableOpacity>
        </View>
      </SignedOut>
    </SafeAreaView>
  )
}
