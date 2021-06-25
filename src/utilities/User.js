/*
This file deal with "user sign in/out" and "get user info".
Only support Google sign in currently.
You should make sure prepareSignInWithGoogle() is called before google sign in.
Also, prepareSignInWithGoogle() should only be called once after app starts.
*/
import auth from '@react-native-firebase/auth';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';

// This function should only be called once after app starts and before google sign in.
export function prepareSignInWithGoogle() {
    GoogleSignin.configure({
        webClientId: '1052555520682-q8ji8mkah1566r9v3eeuifn5jvjudlvr.apps.googleusercontent.com'

    });
}

// Let user sign in with google and return user info.
export async function signInWithGoogle() {
    let userInfo = undefined;
    try {
        await GoogleSignin.hasPlayServices();
        userInfo = await GoogleSignin.signIn();
        // this.setState({ userInfo });
    } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
            console.log("User cancel log in.");
        } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
            console.log("User is signing in.");
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
            console.log("User has no availabe play services.");
        } else {
            // some other error happened
            console.log("Unknown error at signInWithGoogle.");
        }
    }
    return userInfo;
}

// Let user sign out.
// This function also removes this app from user's authorized apps.
export async function signOutWithGoogle() {
    try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        // this.setState({ user: null }); // Remember to remove the user from your app's state as well
    } catch (error) {
        console.error(error);
        throw new Error("Unknown error at signOutWithGoogle.");
    }
}

// Get current user info.
// This function CANNOT be used in ComponentDidMount.
export async function getUserInfo() {
    let userInfo = undefined;
    try {
        
        userInfo = await GoogleSignin.getCurrentUser();
        
        // this.setState({ userInfo });
    } catch (error) {
        if (error.code === statusCodes.SIGN_IN_REQUIRED) {
          // user has not signed in yet
          console.log("User hasn't signed in.");
        } else {
          // some other error
          console.log("Unknown error at getUserInfo.");
        }
    }
    return userInfo;
}


export async function signInFireBase(){
    
    const userData = await getUserInfo();
    const idToken = userData.idToken;
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(googleCredential);
}  



export async function getUid() {
    try 
    {
      
        
        user = auth().currentUser;
        if (user) {
            //console.log(user.uid);
             return user.uid;
        }
        else
        {
            throw new Error("Cannot get user at getUid.");
        }
    }
    catch
    {
        throw new Error("Unknown error at getUid.");
    }
   
   
}

export async function getUsername() {
    try 
    {
        
        const userData = await getUserInfo()
        return userData.user.name;
    }
    catch
    {
        throw new Error("Unknown error at getUsername.");
    }
   
   
}

// This function is used to check if some user is currently signed in.
// If network error happened, getUserInfo may reject but this function may return true.
export async function isUserSignedIn() {
    const isSignedIn = await GoogleSignin.isSignedIn();
    return isSignedIn;
}
