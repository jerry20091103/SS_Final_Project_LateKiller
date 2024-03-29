import firestore from '@react-native-firebase/firestore';
import { getUid } from '../utilities/User';
import{ getProfile, getProfileByUidList, setProfile} from'../api/Profile';
//import{ getProfileByUidList, setProfile} from'../api/Profile';
import {getPredictTime, getAdviseTime} from '../utilities/GetPredictTime';
import moment from 'moment';
const shortid = require('shortid');
let userUid = '';

export async function creatEvent(eventInfo) {

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
                    attendeeMessage:{},
                    active: false,
                    attendeeTransportation:{},
                    attendeePredictTime:{},
                })

            await attendEvent(code);
           
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

        const snapshot = await firestore().collection('event').doc(code).get();
        const data = snapshot.data();
        let newAttendeeStatus = data.attendeeStatus;
        
        for(let attendee in newAttendeeStatus)
        {
            newAttendeeStatus[attendee] = false;
        }
        
        // console.log(newAttendeeStatus);

        await firestore().collection('event').doc(code)
            .update({
                'active':false,
                'title': eventInfo.title,
                'date': eventInfo.date,
                'time': eventInfo.time,
                'placeName': eventInfo.placeName,
                'placeCoord': eventInfo.placeCoord,
                'nameIsAddress': eventInfo.nameIsAddress,
                'attendeeStatus': newAttendeeStatus,
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
                            
                        },
                        "attendeeArrivalTime":{
                            [userUid]:0
                        },
                        "attendeeTransportation":{
                            [userUid] : 'driving'
                        },
                        "attendeePredictTime":{
                            [userUid] :  0
                        },
                        "attendeeMessage": {
                            // [userUid]: '(空白)'
                            [userUid]:''
                                
                        }
                    },{ merge: true });


                let p3 = firestore().collection('users').doc(userUid)
                    .update({
                        "my_events": firestore.FieldValue.arrayUnion(code)
                    })
                let p4 = firestore().collection('event').doc(code).get();
   


                let [r1, r2, r3, snapshot]= await Promise.all([p1, p2, p3, p4]);

                const data = snapshot.data();

                // console.log(data);
                // console.log('here');
                await setArrivalTime(data.placeCoord, code, 'driving'); 

              
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
                    "attendee": firestore.FieldValue.arrayRemove(userUid),
                   
                })

            let p3 = firestore()
                .collection('users')
                .doc(userUid)
                .update({
                    "my_events":  firestore.FieldValue.arrayRemove(code)   
                })
            let p4 = firestore()
                .collection('event')
                .doc(code)
                .set({
                    "attendeeStatus": {
                        [userUid]: firestore.FieldValue.delete()
                    },
                    "attendeeArrivalTime":{
                        [userUid]: firestore.FieldValue.delete()
                    },
                    "attendeeTransportation":{
                        [userUid] : firestore.FieldValue.delete()
                    },
                    "attendeePredictTime":{
                        [userUid] : firestore.FieldValue.delete()
                    }
                },{ merge: true })
            
            let p5 = firestore()
            .collection('event')
            .doc(code)
            .set({
                "attendeeMessage": {
                    [userUid]: firestore.FieldValue.delete()
                },
            },{ merge: true })
            

            let [snapshot, r2, r3, r4, r5] = await Promise.all([p1, p2, p3, p4, p5]);
            
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
            let infoList = await _getEventInfoList(data.my_events);
            return infoList;
        }
        catch (err) {
            console.log(err);
            throw new Error("error when list event");
        }
    }
    else {
        throw new Error("not existed user");
    }

}

/*export async function getAttendeePredictTime(code) {

    if (userUid) {
        // console.log(userUid);
        try {
          
            const snapshot = await firestore().collection('event').doc(code).get();
            const data = snapshot.data();
            return data.attendeePredictTime;
        }
        catch (err) {
            console.log(err);
            throw new Error("error when  get attendee predict time");
        }
    }
    else {
        throw new Error("not existed user");
    }

}*/

async function _getEventInfoList(eventIDList) {
    let eventList = [];

    
    try {
        if (eventIDList.length) {
   
            let querySnapshot = await firestore().collection('event').where(firestore.FieldPath.documentId(), 'in', eventIDList).get()
            querySnapshot.forEach((doc) => {

                let eventInfo = {
                    active: false,
                    id: 'unknown',
                    title: 'unknown',
                    time: 'unknown',
                    timestamp:'unknown',
                    goTime: 'unkown'

                }

              
                const data = doc.data();
                eventInfo.active = data.active;
                eventInfo.id = data.id;
                eventInfo.title = data.title;
                eventInfo.time = data.date +' '+ data.time;
                eventInfo.timestamp = data.date +'T'+ data.time;
                eventInfo.goTime = data.attendeePredictTime[userUid];
                eventList.push(eventInfo);
            });
        }
        return eventList;

    }
    catch{
        throw new Error("error when get eventInfo List");
    }
}


export async function getEventInfo(eventID) {

    let eventInfo = {
        active: false,
        title: 'unknown',
        date: 'unknown',
        location: 'unknown',
        arrival: NaN,
        //attendeeStatus: Array of objects. Objects contain attendee's name and he/she arrives or not.
        attendeeStatus: [],
        attendeeMessage: [],
        nameIsAddress: 'false',
        transpotation:'driving'
    }

    try {

        let Snapshot = await firestore().collection('event').doc(eventID).get()

        let data = Snapshot.data();

        eventInfo.active = data.active;
        eventInfo.title = data.title;
        eventInfo.date = data.date;
        eventInfo.time = data.time;
        eventInfo.placeName = data.placeName;
        eventInfo.placeCoord = data.placeCoord;
        eventInfo.nameIsAddress = data.nameIsAddress;
        eventInfo.transpotation = data.attendeeTransportation[userUid];
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

       let p1 = firestore().collection('event').doc(code)
       .set({
           "attendeeTransportation":{
               [userUid]: mode
           },
          
       },{ merge: true });

       
        if(active){

            let userArrivalTime = 0;
             userArrivalTime = await getPredictTime(desPos, mode)
            
            // console.log( userArrivalTime);

             if(userArrivalTime >=  0 && userArrivalTime <= 1)
             {
                 console.log('arrive');   
                arriveEvent(code);
             }
             
            let p2 = firestore().collection('event').doc(code)
            .update({
                ["attendeePredictTime."+userUid]: userArrivalTime,
            });

            return Promise.all([p1,p2]);

        }
        else
        {

             userArrivalTime = await getAdviseTime(desPos, mode)
            
            // console.log( userArrivalTime);
             
            let p2 = firestore().collection('event').doc(code)
            .update({
                ["attendeePredictTime."+userUid]: userArrivalTime,
            });

            return Promise.all([p1,p2]);
        
        }

      
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
        let p3 = firestore().collection('event').doc(code).get();

        let [active, attendeeList, snapshot] = await Promise.all([p1, p2, p3]);

        const data = snapshot.data();
        let attendeePredictTime = data.attendeePredictTime;
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
                    status: false,
                }

                info.Uid =  attendee.Uid;
                info.username = attendee.username;
                info.img = attendee.img;
                if(active)
                    info.TimebeforeArrive = attendeePredictTime[attendee.Uid];
                else
                    info.TimebeforeArrive = attendee.avgLateTime;

                console.log(info.TimebeforeArrive);
                info.avgLateTime = attendee.avgLateTime;
                info.level = attendee.level;
                info.exp = attendee.exp;
                info.expFull = attendee.expFull;
                info.status = data.attendeeStatus[attendee.Uid];
                attendeeInfo.push(info);

            }
           )

        return attendeeInfo;
    }
    catch
    {
        console.log("error when get event attendee info ");
    }
    
}


export async function arriveEvent(code) {
    if (userUid) {
        try {
          

           
            const timeDiff = await timeDiffCalculate(code);

            await firestore().collection('event').doc(code)
            .update({
                ["attendeeStatus."+userUid]: true,
                ["attendeeArrivalTime."+userUid]: timeDiff,
            }); 
            
            const snapshot = await firestore().collection('event').doc(code).get();
            const data = snapshot.data();
            const attendeeStatus = data.attendeeStatus;
            
           for (let key in attendeeStatus)
            {
                if(attendeeStatus[key] == false)
                {
                   return;
                }
            }

           finishEvent(code);





        }
        catch (err) {
            console.log(err);
            throw new Error("cannot arrive event");
        }
    }
    else {
        throw new Error("not existed user");
    }

}

export async function finishEvent(code) {
    if (userUid) {
        try {

            let snapshot = await firestore().collection('event').doc(code).get();
        
            const data = snapshot.data();



            const newHistory ={
                title: data.title,
                time: data.date + ' ' + data.time,
                arrTimeDiff: data.attendeeArrivalTime[userUid],
            }
           //console.log(data.history);
        //    console.log(newHistory);

            // Event 結算
            // update avg late time should be earlier than writing 
            // new history to database.
            let result = await ExpCalculate(newHistory.arrTimeDiff);
            await _updateAvgLateTime(newHistory);
            await setProfile({
                history:firestore.FieldValue.arrayUnion(newHistory),
                streak: result.streak,
                level: result.level,
                exp: result.exp,
                expFull: result.expFull
            });    
           await setProfile({
            'my_events' : firestore.FieldValue.arrayRemove(code),

        });   

        
        await firestore().collection('event').doc(code).delete();
        console.log('delete empty event');

           if(data.history.length >= 10)
           {
              await setProfile({
                history:firestore.FieldValue.arrayRemove(data.history[0])
              })
           }

            


        }
        catch (err) {
            console.log(err);
            throw new Error("error when leaving event");
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

async function timeDiffCalculate(code) {
    let timeDiff = 0;
    const snapshot = await firestore().collection('event').doc(code).get();
    const data = snapshot.data();
    
    const arrTime =  moment(data.date  +'T'+  data.time);
    const curTime = moment();

    let dura = curTime.format('x') - arrTime.format('x');
    timeDiff = moment.duration(dura);
    return Math.round(timeDiff.minutes());
}

async function _updateAvgLateTime(newHistory)
{
    const snapshot = await firestore().collection('users').doc(userUid).get();
    const data = snapshot.data();

    let eventHistoryLength = data.history.length;
    let newAvgLateTime = 0;

    // calculate newAvgLateTime.
    data.history.forEach((record) => {
        newAvgLateTime += record.arrTimeDiff;
    });
    /*
    newAvgLateTime += newHistory.arrTimeDiff;
    newAvgLateTime -= ((eventHistoryLength < 10) ? 0 : data.history[0].arrTimeDiff);
    */
    newAvgLateTime /= Math.min(eventHistoryLength, 10);

    // Round it to 2 digits after decimal point.
    // EPSILON is for more accurate.
    newAvgLateTime += Number.EPSILON;
    newAvgLateTime = Math.round(newAvgLateTime * 100) / 100;
    
    await setProfile({
        avgLateTime: newAvgLateTime
    });
}

async function ExpCalculate(arrTimeDiff) {
    // recalculate arrive time, let it be >= 1 or <= -1.
    let roundTime = (arrTimeDiff > 0) ? Math.floor(arrTimeDiff) : Math.ceil(arrTimeDiff);
    let profile = await getProfile();
    let result = {
        streak: profile.streak,
        level: profile.level,
        exp: profile.exp,
        expFull: profile.expFull
    }

    // Handle exp change.
    // max punish = -340  
    // max award = 210 
    let lateExp = -100 - Math.min(roundTime, 60) * 3;
    let latePunish = Math.max(profile.streak, -3) * 20;
    let onTimeExp = 100 + Math.min(-roundTime, 30) * 3;
    let onTimeAward = Math.min(profile.streak, 1) * 20;
    
    if(roundTime > 0) {
        // late.
        result.exp = profile.exp + lateExp + ((profile.streak < 0) ? latePunish : 0);
        result.streak = Math.min(profile.streak, 0) - 1;
    } else {
        // on time.
        result.exp = profile.exp + onTimeExp + ((profile.streak >= 0) ? onTimeAward : 0);
        result.streak = Math.max(profile.streak, 0) + 1;
    }

    // Handle level change.
    // level up.
    while(result.exp >= result.expFull) {
        result.level += 1;
        result.exp -= result.expFull;
        result.expFull = 100 * ((result.level >= 0) ? (result.level + 1) : 2);
    }
    // level down.
    while(result.exp < 0) {
        result.level -= 1;
        result.expFull = 100 * ((result.level >= 0) ? (result.level + 1) : 2);
        result.exp += result.expFull;
    }

    return result;


}