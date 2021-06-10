/*
This file deal with user profile.
profile: { 
    name,
    img,
    avgTime,
    level,
    expFull,
    exp
}
*/

// Webpage URL
// To be determined.
const webpageUrl = 'https://localhost:8080/';

export function getProfile(uid) {
    // TODO.
    // Read data from database.
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

export function storeProfile(uid, profile) {
    // TODO
    // Write data to database.
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


