import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
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


    console.log(eventInfo);

    if(userUid)
    {
        let code = _CodeGen();

       //console.log(a);
        //let a = new firebase.firestore.GeoPoint(eventInfo.placeCoor.lat, eventInfo.placeCoor.lng);
                        //placeName: eventInfo.placeName,
                //placeCoor: a,
        console.log(code);
        try{
           await firestore().collection('event').doc(code)
            .set({
                id: code,
                title : eventInfo.title,
                placeName: eventInfo.placeName,
                placeCoor: eventInfo.placeCoor,
                nameIsAddress:eventInfo.nameIsAddress, 
                date: eventInfo.date,
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
             'title' : eventInfo.title,
             'date': eventInfo.date,
             'time': eventInfo.time,
             'placeName': eventInfo.placeName,
             'placeCoor': eventInfo.placeCoor,
             'nameIsAddress': eventInfo.nameIsAddress, 
           })
           return;

    }  
    catch{
              throw new Error("cannot edit the event");
    }
}


export async function attendEvent( code )
{

    //console.log(code);
    if(userUid){
        try{
            
            const profileRef = await firestore().collection('event').doc(code).get();
            if (profileRef.exists) {

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
            else{
                console.log('not existed event');
                throw new EvalError('not existed event');
            }
        }
        catch(err){
            if(err instanceof  EvalError)
                throw new Error('不存在的房間號碼');
            else
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
                if(eventInfo['attendee'].length <= 1 )
                {
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
            infoList = await _getEventInfoList(userProfile["my_events"])
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

async function _getEventInfoList(eventIDList)
{   
   let eventList = [];


    try{
        if(eventIDList.length)
        {
            let  querySnapshot = await firestore().collection('event').where(firestore.FieldPath.documentId(),'in',eventIDList).get()
            querySnapshot.forEach((doc) => {

            let eventInfo ={
                id:'unknown',
                title:'unknown',
                time:'unknown',
                goTime:'unkown'
                
            }

            const data = doc.data();   
             eventInfo.id = data.id;
             eventInfo.title = data.title;
             eventInfo.time = data.date + ' ' + data.time;
             eventList.push( eventInfo);
            });
        }
            return eventList;
          

    }
    catch
    {
        throw new Error("error when get eventInfo");
    }


}


export async function getEventInfo(eventID)
{   

    let eventInfo ={
        title:'unknown',
        date:'unknown',
        location:'unknown',
        arrival: NaN,
        // attendeeStatus: Array of objects. Objects contain attendee's name and he/she arrives or not.
        attendeeStatus: []
    }

    try{

            let  Snapshot = await firestore().collection('event').doc(eventID).get()
            
            let data = Snapshot.data();    


            eventInfo.title = data.title;
            eventInfo.date = data.date;
            eventInfo.time = data.time;
            eventInfo.placeName = data.placeName;
            eventInfo.placeCoor = data.placeCoor;
            try {
                data.attendee.forEach((name) => {
                    eventInfo.attendeeStatus.push({
                        username: name,
                        arrival:  data.attendee_status[name]
                    })
                });
            } catch(error) {
                console.log(error);
                throw new Error("Unknown error at getEventInfo when getting attendee status.");
            }
            
          
            return eventInfo;
    }
    catch
    {
        throw new Error("error when get eventInfo");
    }
}

export async function getEventAttendee(code)
{   
    console.log(code)
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
