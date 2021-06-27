import GetLocation from "react-native-get-location";
import { PermissionsAndroid } from "react-native";

// return the coordinate of the user (object) {lat: ..., lng: ..., status: ...}
// status: 0 = normal, other = error
// timeout is set to 10 sec to wait for gps
export async function getCurrentLocation() {
    try {
        const checkPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (!checkPermission) {
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message:
                        "Late Killer App needs to accesss current location" +
                        "to calculate ETA time for you.",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
        }
        if (checkPermission || granted === PermissionsAndroid.RESULTS.GRANTED) {
            let location = await GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
            })
            return {
                lat: location.latitude,
                lng: location.longitude,
                status: 0
            }
        }
        else {
            return {
                lat: null,
                lng: null,
                status: "Permission request Failed"
            }
        }
    } catch (error) {
        return {
            lat: null,
            lng: null,
            status: error
        }
    }
}