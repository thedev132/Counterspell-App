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
import Event from '~/lib/event';
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import {WriteNfcDialog} from "~/components/WriteNfcDialog";
import {GrantXPDialog} from "~/components/GrantXPDialog";
import {EventAttendanceDialog} from "~/components/EventAttendanceDialog";
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import Prize from '~/lib/prize';
import { PrizeAttendanceDialog } from '~/components/PrizeDialog';
import { InfoDialog } from '~/components/InfoDialog';
import { HuntsDialog } from '~/components/HuntsDialog';
  
export default function Page() {
  const { user } = useUser()
  const { signOut, sessionId, getToken, isSignedIn } = useAuth();
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
    const fetchData = async () => {
      await getUsers();
      await getEvents();
      await getPrizes();
    };
    if (isSignedIn) fetchData();
  }, []);



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
      console.error('OAuth error', JSON.stringify(err));
    }
  }, [startOAuthFlow]);

  const getUsers = async () => {
    if (!sessionId) {
      throw new Error('Session ID is null or undefined');
    }
    let token = await getToken({ sessionId });
    const response = await fetch('https://counterspellsv.xyz/api/users', {
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
    console.log(userList)
  }

  const getEvents = async () => {
    if (!sessionId) {
      throw new Error('Session ID is null or undefined');
    }
    let token = await getToken({ sessionId });
    const response = await fetch('https://counterspellsv.xyz/api/events', {
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
    console.log(eventList)
  }

  const getPrizes = async () => {
    if (!sessionId) {
      throw new Error('Session ID is null or undefined');
    }
    let token = await getToken({ sessionId });
    const response = await fetch('https://counterspellsv.xyz/api/prizes', {
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
        <View className="flex h-full">

  
          <Text className="text-white text-3xl text-center mb-10 mt-20">
            Hello {user?.fullName}!
          </Text>
          <View className="flex flex-grow gap-5 px-10">
            <View className="flex flex-row gap-5">
              <View className="w-1/2 aspect-square">
                <WriteNfcDialog users={allUsers} />
              </View>
              <View className="w-1/2 aspect-square">
                <GrantXPDialog />
              </View>
            </View>
            <View className="flex flex-row gap-5">
              <View className="w-1/2">
                <EventAttendanceDialog events={allEvents} />
              </View>
              <View className="w-1/2 aspect-square">
                <PrizeAttendanceDialog prizes={allPrizes} />
              </View>
            </View>
            <View className="flex flex-row gap-5">
              <View className="w-1/2">
                <InfoDialog />
              </View>
              <View className="w-1/2 aspect-square">
                <HuntsDialog />
              </View>
            </View>
          </View>
          <Text className='text-center text-gray-500 text-sm'>Build a3b45h</Text>
        </View>
      </SignedIn>
  
      <SignedOut>
        <View className="flex h-full items-center justify-center">
          <Text className="text-white text-2xl text-center my-10">
            Welcome to the Counterspell App!
          </Text>
          <Button onPress={onGooglePress} variant={'outline'}>
            <Text>
              Sign In With Google
            </Text>
          </Button>
        </View>
      </SignedOut>
    </SafeAreaView>
  )
  
}
