import {getCurrentLocation} from  './GetCurrentLocation';
import firestore from '@react-native-firebase/firestore';
import {getUid} from'./User'
import { getTravelTime } from  './GetTravelTime';
let userUid = '';
let avgLateTime = NaN;


export  async function getPredictTime(desPos, mode)
{
    const predictTime = await _timePredict(desPos, mode);

    if(predictTime >= 0)
    {
        return  predictTime;
    }
    else
    {
        throw new Error;
    }
}


export  async function getAdviseTime(desPos, mode)
{
    if(!isNaN(avgLateTime))
    {

        const predictTime = await _timePredict(desPos, mode);

        if(predictTime >= 0)
        {
            return avgLateTime + predictTime;
        }
        else
        {
            throw new Error;
        }
    
    }
    
}


export async function predictApiInit(){
    userUid = await getUid();
    const snapshot = await firestore().collection('users').doc(userUid).get();
    const data = snapshot.data();
    avgLateTime = data.avgLateTime;
    return;
}



async function _timePredict(desPos, mode) {

    try
    {
      let arrivalTime = 0;

        const curPos = await getCurrentLocation();
      
  
        //const travelTime = await getTravelTime({lat:curPos.lat,lng:curPos.lng},desPos,mode); /*prvent overuse*/
        //arrivalTime = Math.round(travelTime.value/60);    /*prvent overuse*/
        console.log(arrivalTime);
        return arrivalTime;

    }
    catch
    {
        console.log('arrivalTime Caculation Error')
        return -1;
    }

    
}





