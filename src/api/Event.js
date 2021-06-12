import firestore from '@react-native-firebase/firestore';
import { getUid } from '../utilities/User';

const userUid =  await getUid ();


export  async function creatEvent(eventInfo)
{
    /*
     EventInfo should be:
     {
         title:
         location:
         time:
     }
       #tentative 
    */



    
    if(userUid)
    {
        try{
           await firestore().collection('event').doc()
            .set({
                title : eventInfo.title,
                location: eventInfo.location,
                time: eventInfo.time,
                attendee:[],
              })

              attendEvent( code );  
              return;
               
        }
        catch
        {
            console.log("cannot create an event");
            throw new Error(-1);
        }
    }
    else
    {
        console.log("not existed user");
        throw new Error(-2);
    }
   


}


export function editEvent(eventInfo, code)//待完成
{
    /*
     EventInfo should be:
     {
         title:
         location:
         time:
     }
       #tentative 
    */


}


export async function attendEvent( code )
{

    if(userUid)
    {
        try{
            await firestore().collection('event').doc(String(code))
            .update({
                "attendee":firestore.FieldValue.arrayUnion(userUid)
              })
              
              return;
        }
        catch
        {
            console.log("cannot attend event");
            throw new Error(-1);
        }
    }
    else
    {
        console.log("not existed user");
        throw new Error(-2);
    }

}


export async function leaveEvent(code)// 待完成 尚未完成empty event 刪除
{
    if(userUid)
    {
        try{
            let p1 =  firestore()
            .collection('event')
            .doc(code)
            .get()

            let p2 = firestore()
            .collection('event')
            .doc(code)
            .update({
                "attendee":firestore.FieldValue.arrayRemove(userUid)
              })
            
            let [eventInfo, r2] = await Promise.all([p1, p2]);

            
            return;

        }
        catch
        {
            console.log("cannot leave event");
            throw new Error(-1);
        }
    }
    else
    {
        console.log("not existed user");
        throw new Error(-2);
    }


}

export async function listEvent()
{
    if(userUid)
    {
        try{
            const  userProfile = await firestore().collection('users').doc(userUid).get();
            infoList = await _getEventInfo(userProfile["my_events"])
            return infoList;
        }
        catch
        {
            console.log("damaged userProfile");
            throw new Error(-1);
        }
    }
    else
    {
        console.log("not existed user");
        throw new Error(-2);
    }
   
}

async function _getEventInfo(eventIDList)
{   
    let promises = [];

    try{
        for (eventID of eventIDList)
        {
            let promise =  firestore().collection('event').doc(eventID);
            promises.push(promise);
        }
        let eventList = await Promise.all(promises);
        console.log(eventList);
        return eventList;

    }
    catch
    {
        console.log("error when get eventInfo")
        throw new Error(-1);
    }


}



async function _CodeGen()
{

}
