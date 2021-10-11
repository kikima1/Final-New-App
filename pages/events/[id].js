import { Flex, Heading, Text } from "@chakra-ui/react";
import { useAuthUser, withAuthUser, withAuthUserTokenSSR, AuthAction } from 'next-firebase-auth';
import { getFirebaseAdmin } from 'next-firebase-auth';
import firebase from 'firebase/app';
import 'firebase/firestore';

const SingleEvent = ({itemData}) => {
  // const AuthUser = useAuthUser();
  return (
    <>
      <Flex>
        <Heading>{itemData.name}</Heading>
      </Flex>
      <Flex>
        <Text>{itemData.date}</Text>
      </Flex>
      <Flex>
        <Text>{itemData.dessert}</Text>
      </Flex>
    </>
  );
};

export const getServerSideProps = withAuthUserTokenSSR(
  {
    whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
  }
)(
  async ({ AuthUser, params }) => {
    // take the id parameter from the url and construct a db query with it
    const db = getFirebaseAdmin().firestore();
    const doc = await db.collection("events").doc(params.id).get();
    let itemData;
    if (!doc.empty) {
      // document was found
      let docData = doc.data();
      itemData = {
        id: doc.id,
        dessert:docData.dessert,
        name: docData.name,
        date: docData.date.toDate().toDateString()
      };
    } else {
      // no document found
      itemData = null;
    }
    // return the data
    return {
      props: {
        itemData
      }
    }
  }
)

export default withAuthUser(
  {
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN
  }
)(SingleEvent)




          /* {itemData ?
      itemData.best.map(
        ({id, name})=>(
          <Link key={id} href={`/${id}`}>
          <a className= "list-group-item list-group-item-action">{name}</a>
          </Link>
        )
      )
      :null
          }*/