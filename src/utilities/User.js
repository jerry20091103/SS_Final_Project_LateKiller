/*
This file deal with user sign in and user info.
Only support Google sign in currently.
Note: Function Not Tested Yet. It may not work.
*/

// Let user sign in with google and return the result(user info).
// Using popup window, not redirected page.
export function signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    let info = undefined;
    firebase.auth().signInWithPopup(provider).then(function(result) {
        console.log(result);
        info = result;
        
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        var userinfo = result.user;

    }).catch(function(error) {
        console.log(error);

        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        
        // The email of the user's account used.
        var email = error.email;
        
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

    });
    return info;
}

// Return the current user info, it maybe undefined.
export function getUser() {
    let user = firebase.auth().currentUser;
    if(user) {
        // User is signed in.
        console.log(user);
    } else {
        // No user.
        console.log("No user signed in.");
    }
    return user;
}
