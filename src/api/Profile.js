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
import { getUid, getUsername, getUserImage } from '../utilities/User';
let userUid ='';

// Get user doc from database. Create if none.
// It may fail when server is offline.
export async function getProfile() {

    let profile = {
        Uid: 'unknown',
        username: 'unknown',
        img: '',
        avgLateTime: 0,
        streak: 0, // be on time consecutively. on time -> positive, late -> negative.
        level: 0,
        exp: 0,
        expFull: 100,
        my_events:{},
        history:[],
    }

   const profileRef = await firestore().collection('users').doc(userUid).get();
   if (!profileRef.exists) {
    console.log('No such document exist!');
    let GoogleUsername = await getUsername();
    let GoogleUserImage = await getUserImage();
    // Fix the returned profile.
    profile = {
        Uid: userUid,
        username: GoogleUsername,
        img: GoogleUserImage,
        avgLateTime: 0,
        streak: 0,   
        level: 0,
        exp: 0,
        expFull: 100,
        my_events:[],
        history:[],
        transportation:'',
    }
    await firestore().collection('users').doc(userUid).set(profile);
   } else {
    profile = profileRef.data();
    // Handle possible errors like unknown name and image.
    // Username and image may change, need to keep track on this and update.
    let googleUsername = await getUsername();
    let googleUserImage = await getUserImage();
    if((profile.username === 'unknown') || (profile.username !== googleUsername)) {
        profile.username = googleUsername;
        await firestore().collection('users').doc(userUid).update({
            username: googleUsername
        }).then(() => {
            // console.log('User updated!');
        }).catch((error) => {
            console.log(error);
            throw new Error("Unknown error at getProfile when correcting unknown username.");
        });
    }
    if((!profile.img) || (profile.img !== googleUserImage)) {
        profile.img = googleUserImage;
        await firestore().collection('users').doc(userUid).update({
            img: googleUserImage
        }).then(() => {
            // console.log('User updated!');
        }).catch((error) => {
            console.log(error);
            throw new Error("Unknown error at getProfile when correcting empty user image.");
        });
    }
    if(profile.streak === undefined) {
        profile.streak = 0;
        await firestore().collection('users').doc(userUid).update({
            streak: 0
        }).then(() => {
            // console.log('User updated!');
        }).catch((error) => {
            console.log(error);
            throw new Error("Unknown error at getProfile when correcting undefined streak.");
        });
    }

    //console.log(profile);
   }
   
   return profile;
};


export async function getProfileByUidList(UidList, code) {
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
                    img: '',
                    avgLateTime: 0,
                    level: 0,
                    exp: 0, 
                    expFull: 100,
                };
                profile.Uid =  data.Uid;
                profile.username = data.username;
                profile.img = data.img;
                profile.avgLateTime = data.avgLateTime;
                profile.level = data.level;
                profile.exp=data.exp;
                profile.expFull = data.expFull;
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



export async function getRecord() {
    const snapshot = await firestore().collection('users').doc(userUid).get();
    const data = snapshot.data();

    return data.history;

};

// Get and set Uid.
export async function ProfileApiInit() {
    userUid = await getUid();
    return;
}




