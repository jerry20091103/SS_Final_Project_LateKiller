import firestore from '@react-native-firebase/firestore';
import { getUid } from '../utilities/User';
import moment from 'moment';
const userUid = 'uid_user1234543243';


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

     console.log(eventInfo);

    let emptyArr = [];
    let emptyMap = {};
    if(userUid)
    {
        let code = _CodeGen();

        try{
           await firestore().collection('event').doc(code)
            .set({
                id: [code],
                title : [eventInfo.title],
                location: [eventInfo.location],
                time: [eventInfo.time],
                attendee: [],
                attendee_status: {},
              })

             attendEvent( code );  
              return;
               
        }
        catch
        {

            throw new Error("cannot create an event");
        }
    }
    else
    {
        throw new Error("not existed user");
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


            let p1 = firestore().collection('event').doc(String(code))
            .update({
                "attendee":firestore.FieldValue.arrayUnion(userUid),
              })

            let p2 = firestore().collection('event').doc(String(code))
            .set({
                "attendee_status": {
                    [userUid]: false
                  }
                },  {merge:true});   

            
            let p3 = firestore().collection('users').doc(userUid)
            .update({
                "my_events":firestore.FieldValue.arrayUnion(code)
            })    
              
           await Promise.all([p1,p2,p3]); 
            return;
        }
        catch
        {
            throw new Error("cannot attend event");
        }
    }
    else{

        throw new Error("not existed user");
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

            throw new Error("cannot leave event");
        }
    }
    else
    {
        throw new Error("not existed user");
    }


}

export async function listEvent()
{
    if(userUid)
    {
        try{
            const  userProfileSet = await firestore().collection('users').doc(userUid).get();
            const userProfile = userProfileSet.data();
            infoList = await getEventInfo(userProfile["my_events"])
            return infoList;
        }
        catch(err)
        {
            throw new Error("damaged userProfile");
        }
    }
    else
    {
        throw new Error("not existed user");
    }
   
}

export async function getEventInfo(eventIDList)
{   
   let eventList = [];

    try{
           let  querySnapshot = await firestore().collection('event').where(firestore.FieldPath.documentId(),'in',eventIDList).get()
            querySnapshot.forEach((doc) => {
            let data = doc.data();    
            let timestamp = data["time"];
             timestamp = moment.unix(parseInt(timestamp)).calendar();
             data["time"] = timestamp;
             eventList.push(data);
            });

             return eventList;

    }
    catch
    {
        throw new Error("error when get eventInfo");
    }


}



function _CodeGen()
{
    return String(123456);
}