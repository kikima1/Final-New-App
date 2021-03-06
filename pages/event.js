import React, { useState, useEffect } from 'react';
import {
    Container,
    Flex,
    Heading,
    InputGroup,
    InputLeftElement,
    Input,
    Button,
    Text,
    IconButton,
    Divider,
    Link,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
    useAuthUser,
    withAuthUser,
    withAuthUserTokenSSR,
    AuthAction,
} from 'next-firebase-auth';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Header from '../components/Header';
import Layout from '../components/Layout';

const Event = () => {
  const AuthUser = useAuthUser();
  const [inputName, setInputName] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [inputDessert, setInputDessert] = useState('');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    AuthUser.id &&
      firebase
        .firestore()
        .collection("events")
        .where( 'user', '==', AuthUser.id )
        .onSnapshot(
          snapshot => {
            setEvents(
              snapshot.docs.map(
                doc => {
                  return {
                    eventID: doc.id,
                    eventName: doc.data().name,
                    eventDate: doc.data().date.toDate().toDateString(),
                    eventDessert: doc.data().dessert


                  }
                }
              )
            );
          }
        )
  })

  const sendData = () => {
    try {
      // try to update doc
      firebase
        .firestore()
        .collection("events") // all users will share one collection
        .add({
          name: inputName,
          date: firebase.firestore.Timestamp.fromDate( new Date(inputDate) ),
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          dessert: inputDessert,
          user: AuthUser.id
        })
        .then(console.log('Data was successfully sent to cloud firestore!'));
      // flush out the user-entered values in the input elements onscreen
      setInputName('');
      setInputDate('');
      setInputDessert('');

    } catch (error) {
      console.log(error);
    }
  }

  const deleteEvent = (t) => {
    try {
      firebase
        .firestore()
        .collection("events")
        .doc(t)
        .delete()
        .then(console.log('Data was successfully deleted!'));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Header 
        email={AuthUser.email} 
        signOut={AuthUser.signOut} />
      <Flex flexDir="column" maxW={800} align="left" justify="start" minH="100vh" m="auto" px={2} py={6}>
      <Heading size="xl">New Event</Heading>
      <Flex flexDir="column" maxW={800} align="left" justify="start" minH="100vh" m="auto" px={10} py={6}>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children=""
          />
          <Input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder=" Title" />
          <Input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} placeholder="Event Date" />
          <Input type="text" value={inputDessert} onChange={(e) => setInputDessert(e.target.value)} placeholder=" Dessert" />
          <Button
            ml={2}
            onClick={() => sendData()}
          >
            Add
          </Button>
        </InputGroup>

        {events.map((item, i) => {
          return (
            <React.Fragment key={i}>
              {i > 0 && <Divider />}
              <Flex
                w="100%"
                p={5}
                my={2}
                align="center"
                borderRadius={5}
                justifyContent="space-between"
              >
                <Flex align="center">
                  <Text fontSize="xl" mr={4}>{i + 1}.</Text>
                  <Text>
                    <Link href={'/events/' + item.eventID}>
                    {item.eventName}
                    </Link>
                  </Text>
                  <Text>... {item.eventDate}</Text>
                  <Text>... {item.eventDessert}</Text>

                </Flex>
                <IconButton onClick={() => deleteEvent(item.eventID)} icon={<DeleteIcon />} />
              </Flex>
            </React.Fragment>
          )
        })}
        </Flex>
      </Flex>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, req }) => {
  return {
    props: {
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
})(Event)