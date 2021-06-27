import { browserApiKey } from '../api/google-web-api-key.json';

var baseUrl = "https://maps.googleapis.com/maps/api/distancematrix/json?";

// return the required time to go from "src" to "dist", with "mode" as travel method
// src and dist: (object) {lat: ..., lng: ...} (coordinates)
// mode: (string) "driving" / "walking" / "bicycling" / "transit"
// return value: (object) {value: ..., text: ...} (value is the required time in seconds, text is the auto converted string)

export async function getTravelTime(src, dist, mode) {
    try {
        let url = baseUrl + "origins=" + src.lat + "," + src.lng + "&destinations=" + dist.lat + "," + dist.lng + "&mode=" + mode + "&language=zh-TW" + "&key=" + browserApiKey
        let res = await fetch(url);
        let val = await res.json();
        return {
            value: val.rows[0].elements[0].duration.value,
            text: val.rows[0].elements[0].duration.text,
        }
    } catch (error) {
        console.log(error);
    }
}