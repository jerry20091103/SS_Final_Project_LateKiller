/*
This file deal with user profile.
These functions need userId.
You may get userId with getUid() 
(getUid() can be imported from 'src/utilities/User.js')

profile: { 
    name,
    img,
    avgTime,
    level,
    expFull,
    exp
}
*/

var database = firebase.database();

// Get user profile from database.
// Need userId.
export function getProfile(userId) {
    var profile = undefined;
    database.ref('users/' + userId + '/profile').get().then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            profile = snapshot.val();
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.log(error);
    });
    return profile;

    /*
    let url = `${webpageUrl}/profile`;
    
    url += `?user=${name}`;

    console.log(`Making GET request to: ${url}`);

    return fetch(url, {
        headers: {
            'Accept': 'application/json'
        }
    }).then(res => {
        if (res.status !== 200)
            throw new Error(`Unexpected response code: ${res.status}`);

        return res.json();
    });
    */
}

// Store user profile to database.
// Need userId and profile.
export function storeProfile(userId, profile) {
    database.ref('users/' + userId + '/profile').set({
        uid: userId,
        profile: profile
    });

    /*
    let url = `${webpageUrl}/profile`;

    console.log(`Making POST request to: ${url}`);
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            profile
        })
    }).then(function(res) {
        if (res.status !== 200)
            throw new Error(`Unexpected response code: ${res.status}`);

        return res.json();
    });
    */
}


