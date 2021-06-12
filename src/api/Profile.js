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

// Get user doc from database.
// It may fail when server is offline.
export function getProfile(userId) {
    let profile = [];
    firestore().collection('users').doc(userId.toString()).get().then((userData)=>{
        profile = userData;
        // console.log(userData);
    }).catch((error) => {
        console.log(error);
    });
    return profile;
};

// Add user profile to database.
// Return true if add success, and return false when failed.
function addProfile(userId, profile) {
    let success = false;
    firestore().collection('users').doc(userId.toString()).set({
        username: profile.username,
        img: profile.img,
        avgLateTime: profile.avgLateTime,
        level: profile.level,
        expFull: profile.expFull,
        exp: profile.exp
    }).then(() => {
        success = true;
        // console.log('User added!');
    }).catch((error) => {
        console.log(error);
    });
    return success;
};

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




