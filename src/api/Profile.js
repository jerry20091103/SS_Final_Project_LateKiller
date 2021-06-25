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

WARNING: NOT TESTED YET. CODE MAY NOT WORK.
*/
import firestore from '@react-native-firebase/firestore';
import { getUid, getUsername } from '../utilities/User';
let userUid ='';

// Get user doc from database.
// It may fail when server is offline.
export async function getProfile() {
    let profile =   {
        username:'unknown',
        avgLateTime: 0,
        level: 0,
        exp: 0, 
        expFull: 100
    };
   const profileRef = await firestore().collection('users').doc(userUid).get();
   if (!profileRef.exists) {
     console.log('No such document exist!');
    let GoogleUsername = await getUsername();
    profile.username =  GoogleUsername;
     await firestore().collection('users').doc(userUid).set({
        username: GoogleUsername,
        img: '',
        avgLateTime: 0,
        level: 0,
        exp: 10,
        expFull: 100,
        transportation:'',
        my_events:[],
        history:[]
     })
   } else {
    profile = profileRef.data();
    console.log(profile);
   }
   
   return profile;
};

// Add user profile to database.
// Return true if add success, and return false when failed.
/*function addProfile(userId) {
    let success = false;
    firestore().collection('users').doc(userId.toString()).set({
        //username: profile.username,
        img: '',
        avgLateTime: 0,
        level: 0,
        expFull: 100,
        exp: 10
    }).then(() => {
        success = true;
        // console.log('User added!');
    }).catch((error) => {
        console.log(error);
    });
    return success;
};*/

// Update user profile in database.
// Return true if add success, and return false when failed.
function updateProfile(userId, profile) {
    let success = false;
    firestore().collection('users').doc(userId.toString()).update({
        username: profile.username,
        img: profile.img,
        avgLateTime: profile.avgLateTime,
        level: profile.level,
        expFull: profile.expFull,
        exp: profile.exp
    }).then(() => {
        success = true;
        // console.log('User updated!');
    }).catch((error) => {
        console.log(error);
    });
    return success;
};

// Store user profile to database.
// Return true if add success, and return false when failed.
export function storeProfile(userId, profile) {
    if(isProfileAvailable(userId)) {
        return updateProfile(userId, profile);
    } else {
        return addProfile(userId, profile);
    }
    // return false;
};

// Check if profile available.
// This may fail due to server offline.
export function isProfileAvailable(userId) {
    let profile = getProfile(userId);
    return profile ? true : false;
};


export async function ProfileApiInit() {
    userUid = await getUid();
  // console.log(userUid);
    return;
}




