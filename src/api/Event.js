import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import { getUid } from '../utilities/User';
import{ getProfileByUidList} from'../api/Profile';
import {getCurrentLocation} from  '../utilities/GetCurrentLocation';
import { getTravelTime } from  '../utilities/GetTravelTime';
import moment from 'moment';
import { Item } from 'native-base';
const shortid = require('shortid');
let userUid = '';

export async function creatEvent(eventInfo) {
    /*
     EventInfo should be:
     {
         title:
         location:
         time:
     }
       #tentative 
    */
    if (userUid) {
        let code = _CodeGen();
        try {
            await firestore().collection('event').doc(code)
                .set({
                    id: code,
                    title: eventInfo.title,
                    placeName: eventInfo.placeName,
                    placeCoord: eventInfo.placeCoord,
                    nameIsAddress: eventInfo.nameIsAddress,
                    date: eventInfo.date,
                    time: eventInfo.time,
                    attendee: [],
                    attendeeStatus: {},
                    attendeeMessage:[],
                    active: false
                })

            attendEvent(code);
            return;
        }
        catch{
            throw new Error("cannot create an event");
        }
    }
    else {
        throw new Error("not existed user");
    }
}


export async function editEvent(eventInfo, code) {

    try {
        await firestore().collection('event').doc(code)
            .update({
                'title': eventInfo.title,
                'date': eventInfo.date,
                'time': eventInfo.time,
                'placeName': eventInfo.placeName,
                'placeCoord': eventInfo.placeCoord,
                'nameIsAddress': eventInfo.nameIsAddress,
            })
        return;

    }
    catch {
        throw new Error("cannot edit the event");
    }
}


export async function attendEvent(code) {
    //console.log(code);
    if (userUid) {
        try {

            const profileRef = await firestore().collection('event').doc(code).get();
            if (profileRef.exists) {

                let p1 = firestore().collection('event').doc(code)
                    .update({
                        "attendee": firestore.FieldValue.arrayUnion(userUid),
                    })

                let p2 = firestore().collection('event').doc(code)
                    .set({
                        "attendeeStatus": {
                            [userUid]: false
                            
                        }
                    }, { merge: true });


                let p3 = firestore().collection('users').doc(userUid)
                    .set({
                        "my_events": {
                            [code] : null
                        }
                    },{merge:true})

                await Promise.all([p1, p2, p3]);
                return;
            }
            else {
                console.log('not existed event');
                throw new EvalError('not existed event');
            }
        }
        catch (err) {
            if (err instanceof EvalError)
                throw new Error('不存在的房間號碼');
            else
                throw new Error("cannot attend event");
        }
    }
    else {
        throw new Error("not existed user");
    }

}


export async function leaveEvent(code) {
    if (userUid) {
        try {

            let p1 = firestore()
                .collection('event')
                .doc(code)
                .get()

            let p2 = firestore()
                .collection('event')
                .doc(code)
                .update({
                    "attendee": firestore.FieldValue.arrayRemove(userUid)
                })

            let p3 = firestore()
                .collection('users')
                .doc(userUid)
                .set({
                    "my_events": {
                        [code]: firestore.FieldValue.delete()
                    },
                },{ merge: true })
            let p4 = firestore()
                .collection('event')
                .doc(code)
                .set({
                    "attendeeStatus": {
                        [userUid]: firestore.FieldValue.delete()
                    },
                },{ merge: true })

            let [snapshot, r2, r3, r4] = await Promise.all([p1, p2, p3, p4]);

            let eventInfo = snapshot.data()
            if (eventInfo['attendee'].length <= 1) {
                await firestore().collection('event').doc(code).delete();
                console.log('delete empty event')
            }

            return;
        }
        catch{
            throw new Error("cannot leave event");
        }
    }
    else {
        throw new Error("not existed user");
    }

}

export async function listEvent() {

    if (userUid) {
        // console.log(userUid);
        try {
          
            let eventList = []
            const snapshot = await firestore().collection('users').doc(userUid).get();
            const data = snapshot.data();
            let events = data.my_events;
            let infoList = await _getEventInfoList(Object.keys(events));
            return infoList;
        }
        catch (err) {
            console.log(err);
            throw new Error("damaged userProfile");
        }
    }
    else {
        throw new Error("not existed user");
    }

}

async function _getEventInfoList(eventIDList) {
    let eventList = [];

    try {
        if (eventIDList.length) {
            let querySnapshot = await firestore().collection('event').where(firestore.FieldPath.documentId(), 'in', eventIDList).get()
            querySnapshot.forEach((doc) => {

                let eventInfo = {
                    id: 'unknown',
                    title: 'unknown',
                    time: 'unknown',
                    goTime: 'unkown'

                }

                const data = doc.data();
                eventInfo.id = data.id;
                eventInfo.title = data.title;
                eventInfo.time = data.date + ' ' + data.time;
                eventList.push(eventInfo);
            });
        }
        return eventList;

    }
    catch{
        throw new Error("error when get eventInfo");
    }
}


export async function getEventInfo(eventID) {

    let eventInfo = {
        title: 'unknown',
        date: 'unknown',
        location: 'unknown',
        arrival: NaN,
        // attendeeStatus: Array of objects. Objects contain attendee's name and he/she arrives or not.
        attendeeStatus: [],
        attendeeMessage: [],
    }

    try {

        let Snapshot = await firestore().collection('event').doc(eventID).get()

        let data = Snapshot.data();


        eventInfo.title = data.title;
        eventInfo.date = data.date;
        eventInfo.time = data.time;
        eventInfo.placeName = data.placeName;
        eventInfo.placeCoord = data.placeCoord;
        try {
            data.attendee.forEach((id) => {
                eventInfo.attendeeStatus.push({
                    userUid: id,
                    arrival: data.attendeeStatus[id],
                });
                eventInfo.attendeeMessage.push({
                    userUid: id,
                    message: data.attendeeMessage[id],
                });
            });
        } catch (error) {
            console.log(error);
            throw new Error("Unknown error at getEventInfo when getting attendee status or message.");
        }


        return eventInfo;
    }
    catch
    {
        throw new Error("error when get eventInfo");
    }
}

async function _getEventAttendee(code) {
    let attendee = [];

    try {
        let Snapshot = await firestore().collection('event').doc(code).get()
        let data = Snapshot.data();
        attendee = data['attendee'];
        return attendee;
    }
    catch
    {
        console.log("error when get attendee");
        return attendee;

    }
}

export async function  setArrivalTime(desPos, code, mode) {

    try {
        let active = false;
       active = await _checkEventStatus(code);
        
        active = true;//test

        console.log(userUid);
        if(active)
        {
            let userArrivalTime = 0;
             userArrivalTime = await _arrivalTimeCaculate(desPos, mode)
            
             
            await firestore().collection('users').doc(userUid)
            .update({
                ["my_events."+code]: userArrivalTime,
            });

        }

        return;
    }
    catch
    {
        console.log("error when set arrival time");
    }

}


export async function  getEventAttendeeInfo (code) {
    try {

        



        let p1 = _checkEventStatus(code);
        let p2 = _getEventAttendee(code);
        let [active, attendeeList] = await Promise.all([p1, p2]);
        let attendeeData = await getProfileByUidList(attendeeList, code);
        let attendeeInfo = [];

       
            attendeeData.forEach((attendee)=>{

                let info = {
                    Uid : 'unknown',
                    username:'unknown',
                    img: '',
                    TimebeforeArrive: 0,
                    avgLateTime: 0,
                    level: 0,
                    exp: 0, 
                    expFull: 100,
                }

                info.Uid =  attendee.Uid;
                info.username = attendee.username;
                info.img = attendee.img;
                if(active)
                    info.TimebeforeArrive = attendee.calTime;
                else
                    info.TimebeforeArrive = attendee.avgLateTime;
                info.avgLateTime = attendee.avgLateTime;
                info.level = attendee.level;
                info.exp = attendee.exp;
                info.expFull = attendee.expFull;
                attendeeInfo.push(info);

            }
           )
        
       console.log(attendeeInfo);


        return attendeeInfo;
    }
    catch
    {
        console.log("error when get event attendee info ");
    }
    
}

export async function finishEvent(code) {
    if (userUid) {
        try {
            let p1 = firestore()
                .collection('event')
                .doc(code)
                .update({
                    "attendee": firestore.FieldValue.arrayRemove(userUid)
                })

            let p2 = firestore().collection('event').doc(code)
                .set({
                    "attendeeStatus": {
                        [userUid]: false
                    }
                }, { merge: true });

        }
        catch (err) {
            console.log(err);
            throw new Error("damaged userProfile");
        }
    }
    else {
        throw new Error("not existed user");
    }

}

export async function EventApiInit() {
    // shortid.characters(base64)
    userUid = await getUid();
    return;
}

function _CodeGen() {
    return shortid.generate();
}

async function _arrivalTimeCaculate(desPos, mode) {

    try
    {
      let arrivalTime = 0;

        const curPos = await getCurrentLocation();
      
  
        //const travelTime = await getTravelTime({lat:curPos.lat,lng:curPos.lng},desPos,mode); /*prvent overuse*/
        //arrivalTime = (travelTime.value + 300)/60;    /*prvent overuse*/
      
        return arrivalTime;

    }
    catch
    {
        console.log('arrivalTime Caculation Error')
        return 0;
    }

    
}

async function _checkEventStatus(code) {
    const snapshot = await firestore().collection('event').doc(code).get();
    const data = snapshot.data();

    if(data.active)
    {
        return true;
    }
    else
    {

        let nowPlusAnHour = moment().add(1, 'hour');
        let ans =  nowPlusAnHour.isAfter(data.date  +'T'+  data.time);
        console.log(ans);

        if(ans)
        {
            await firestore().collection('event').doc(code).update({
                active : true
            });
            return true

        }
        else
        {
            return false;
        }
    }

    
}