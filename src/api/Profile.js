/*
This file deal with user profile.
Since we use Google signin, username may not be unique.
Therefore, I implement these function with userId.
You may get userId with getUid() in 'src/utilities/User.js'
Note that getUid() returns 0 if failed.

profile: { 
    username,
    img,
    avgLateTime,
    level,
    expFull,
    exp
}

*/
import firestore from '@react-native-firebase/firestore';
import { getUid, getUsername } from '../utilities/User';
let userUid ='';

// Get user doc from database. Create if none.
// It may fail when server is offline.
export async function getProfile() {

    let profile = {
        Uid: 'unknown',
        username: 'unknown',
        img: '',
        avgLateTime: 0,
        level: 0,
        exp: 10,
        expFull: 100,
        transportation:'',
        my_events:[],
        history:[]
    }

   const profileRef = await firestore().collection('users').doc(userUid).get();
   if (!profileRef.exists) {
    console.log('No such document exist!');
    let GoogleUsername = await getUsername();
    // Fix the returned profile.
    profile = {
        Uid: userUid,
        username: GoogleUsername,
        img: '',
        avgLateTime: 0,
        level: 0,
        exp: 10,
        expFull: 100,
        transportation:'',
        my_events:[],
        history:[]
    }
    await firestore().collection('users').doc(userUid).set(profile);
   } else {
    profile = profileRef.data();
    //console.log(profile);
   }
   
   return profile;
};


export async function getProfileByUidList(UidList) {
    let profileList = []
   
    try 
    {
        
         if(UidList.length>0)
        {
            console.log(UidList);
            let  querySnapshot = await firestore().collection('users').where(firestore.FieldPath.documentId(),'in',UidList).get()
            querySnapshot.forEach((doc) => {
        
                const data = doc.data();
            
                let profile =   {
                    Uid : 'unknown',
                    username:'unknown',
                    avgLateTime: 0,
                    level: 0,
                    exp: 0, 
                    expFull: 100,
                    TimebeforeArrive: 0,
                   
                };
                profile.Uid =  data.Uid;
                profile.username = data.username;
                profile.avgLateTime = data.avgLateTime;
                profile.level = data.level;
                
                console.log(profile);
                profileList.push(profile);
         
            });
            
        }
    }
    catch
    {
        console.log('error when get attendee profile')
    }
   
    return   profileList;

   
   
};

// Set user profile. 
// Example: 
// setProfile({
//    expFull: 999,
//    exp: 1
// })
export async function setProfile(profile) {
    // Get profile first in case of no profile exists.
    await getProfile();
    await firestore().collection('users').doc(userUid).update(profile).then(() => {
        // console.log('User updated!');
    }).catch((error) => {
        console.log(error);
        throw new Error("Unknown error at setProfile.");
    });
};

// Get and set Uid.
export async function ProfileApiInit() {
    userUid = await getUid();
  // console.log(userUid);
    return;
}




