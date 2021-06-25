import firestore from '@react-native-firebase/firestore';
import { getUid } from '../utilities/User';
import moment from 'moment';
const shortid = require('shortid');
let userUid = '';

export async function creatEvent(eventInfo)
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
        let code = _CodeGen();

        try{
           await firestore().collection('event').doc(code)
            .set({
                id: code,
                title : eventInfo.title,
                location: [eventInfo.location],
                time: eventInfo.time,
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


export async function editEvent(eventInfo, code)
{
    try{
        await firestore().collection('event').doc(code)
         .update({
             'title' : [eventInfo.title],
             'location': [eventInfo.location],
             'time': [eventInfo.time]
           })
           return;

    }  
    catch{
              throw new Error("cannot edit the event");
    }
}


export async function attendEvent( code )
{

    console.log(code);
    if(userUid){
        try{


            let p1 = firestore().collection('event').doc(code)
            .update({
                "attendee":firestore.FieldValue.arrayUnion(userUid),
              })

            let p2 = firestore().collection('event').doc(code)
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
        catch{
            throw new Error("cannot attend event");
        }
    }
    else{

        throw new Error("not existed user");
    }

}


export async function leaveEvent(code)
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
            
            let p3 = firestore()
            .collection('users')
            .doc(userUid)
            .update({
                "my_events":firestore.FieldValue.arrayRemove(code)
              })
            
            let [snapshot, r2, r3] = await Promise.all([p1, p2, p3]);

            let eventInfo = snapshot.data()
            console.log(eventInfo['attendee'].length);
            console.log(eventInfo['attendee']);
            if(eventInfo['attendee'].length <= 1 )
            {
                console.log(code);
                await firestore().collection('event').doc(code).delete();
                console.log('delete empty event')
                
            }
            
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
       // console.log(userUid);
        try{
            const  userProfileSet = await firestore().collection('users').doc(userUid).get();
            const userProfile = userProfileSet.data();
            infoList = await getEventInfo(userProfile["my_events"])
            return infoList;
        }
        catch(err)
        {
            console.log(err);
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
        if(eventIDList.length)
        {
            let  querySnapshot = await firestore().collection('event').where(firestore.FieldPath.documentId(),'in',eventIDList).get()
            querySnapshot.forEach((doc) => {
            let data = doc.data();    
            let timestamp = data["time"];
             timestamp = moment.unix(timestamp.seconds).calendar();
             data["time"] = timestamp;
             eventList.push(data);
            });
        }
            return eventList;
          

    }
    catch
    {
        throw new Error("error when get eventInfo");
    }


}

export async function getEventAttendee(code)
{   
   let attendee = [];

    try{
            let  Snapshot = await firestore().collection('event').doc(code).get()
            let  data = Snapshot.data();
            attendee = data['attendee'];
            return attendee;
    }
    catch
    {
        console.log("error when get attendee");
        return attendee;
  
    }
}

export async function finishEvent(code)
{
    
    
    if(userUid)
    {
        try{
            let p1 = firestore()
            .collection('event')
            .doc(code)
            .update({
                "attendee":firestore.FieldValue.arrayRemove(userUid)
              })

              let p2 = firestore().collection('event').doc(String(code))
              .set({
                  "attendee_status": {
                      [userUid]: false
                    }
                  },  {merge:true});   
           
        }
        catch(err)
        {
            console.log(err);
            throw new Error("damaged userProfile");
        }
    }
    else
    {
        throw new Error("not existed user");
    }
   
}


export async function EventApiInit() {
   // shortid.characters(base64)
    userUid = await getUid();
    return;
}



function _CodeGen(){
     return shortid.generate();
}
