import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { getWeatherDataByCoords } from './dataService'; 
const WHO_THRESHOLDS = {
    temperature: {
        high: 32,
        low: 5   
    },
    rain: {
        heavy: 5 
    },
    pm25: {
        moderate: 15, 
        unhealthy: 25,
        veryUnhealthy: 35,
        hazardous: 50
    }
};

let sentNotifications = [];

// Fonction pour vérifier les conditions et déclencher les notifications
export async function checkAndTriggerNotifications() {
    try {
        const coordinates = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = coordinates.coords;
        const weatherData = await getWeatherDataByCoords(latitude, longitude);

        if (!weatherData) {
            console.warn("Impossible de récupérer les données météo pour les notifications.");
            return;
        }

        const notificationsToTrigger = [];

        // Vérification de la température
        const currentTemp = weatherData.weather?.temp_c;
        if (currentTemp !== undefined) {
            if (currentTemp >= WHO_THRESHOLDS.temperature.high) {
                notificationsToTrigger.push({
                    id: Date.now() + 1, // ID unique
                    title: "Alerte Chaleur Élevée !",
                    body: `La température actuelle est de ${currentTemp}°C. Risque de coup de chaleur. Restez hydraté et à l'ombre. (Source: OMS)`, 
                    data: { type: 'temperature', level: 'high', value: currentTemp }
                });
            } else if (currentTemp <= WHO_THRESHOLDS.temperature.low) {
                notificationsToTrigger.push({
                    id: Date.now() + 2,
                    title: "Alerte Température Basse !",
                    body: `La température actuelle est de ${currentTemp}°C. Risque d'hypothermie. Couvrez-vous bien. (Source: OMS)`, 
                    data: { type: 'temperature', level: 'low', value: currentTemp }
                });
            }
        }

        // Vérification des précipitations
        const currentRain = weatherData.weather?.precip_mm;
        if (currentRain !== undefined && currentRain >= WHO_THRESHOLDS.rain.heavy) {
            notificationsToTrigger.push({
                id: Date.now() + 3,
                title: "Alerte Fortes Pluies !",
                body: `De fortes pluies (${currentRain}mm) sont signalées. Risque d'inondation. Soyez vigilant. (Source: OMS)`, 
                data: { type: 'rain', level: 'heavy', value: currentRain }
            });
        }

        // Vérification des PM2.5
        const currentPm25 = weatherData.ai_prediction?.days?.[0]?.pm25;
        if (currentPm25 !== undefined) {
            let pm25Alert = null;
            if (currentPm25 >= WHO_THRESHOLDS.pm25.hazardous) {
                pm25Alert = { level: 'hazardous', message: `Qualité de l'air dangereuse (${currentPm25} µg/m³). Port du masque FFP2 obligatoire. (Source: OMS)` };
            } else if (currentPm25 >= WHO_THRESHOLDS.pm25.veryUnhealthy) {
                pm25Alert = { level: 'veryUnhealthy', message: `Qualité de l'air très mauvaise (${currentPm25} µg/m³). Évitez les activités en extérieur. (Source: OMS)` };
            } else if (currentPm25 >= WHO_THRESHOLDS.pm25.unhealthy) {
                pm25Alert = { level: 'unhealthy', message: `Qualité de l'air mauvaise (${currentPm25} µg/m³). Limitez les efforts prolongés. (Source: OMS)` };
            } else if (currentPm25 >= WHO_THRESHOLDS.pm25.moderate) {
                pm25Alert = { level: 'moderate', message: `Qualité de l'air modérée (${currentPm25} µg/m³). Personnes sensibles, soyez vigilantes. (Source: OMS)` };
            }

            if (pm25Alert) {
                notificationsToTrigger.push({
                    id: Date.now() + 4,
                    title: `Alerte PM2.5 - ${pm25Alert.level.toUpperCase()}!`, 
                    body: pm25Alert.message,
                    data: { type: 'pm25', level: pm25Alert.level, value: currentPm25 }
                });
            }
        }
        for (const notif of notificationsToTrigger) {
            
            const isDuplicate = sentNotifications.some(sNotif => 
                sNotif.data.type === notif.data.type && 
                sNotif.data.level === notif.data.level &&
                (Date.now() - sNotif.timestamp < 3600000) 
            );

            if (!isDuplicate) {
                await LocalNotifications.schedule({
                    notifications: [{
                        title: notif.title,
                        body: notif.body,
                        id: notif.id,
                        schedule: { at: new Date(Date.now() + 1000) }, 
                        sound: null,
                        attachments: null,
                        actionTypeId: "",
                        extra: notif.data
                    }]
                });
                sentNotifications.push({ ...notif, timestamp: Date.now() });
                console.log("Notification envoyée :", notif.title);
            }
        }

    } catch (error) {
        console.error("Erreur lors de la vérification des notifications :", error);
    }
}

export function getNotificationHistory() {
    return sentNotifications;
}

export function startBackgroundMonitoring() {
    
    setInterval(checkAndTriggerNotifications, 300000); 
    console.log("Monitoring des notifications démarré.");
}
export async function requestNotificationPermissions() {
    let permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
        permStatus = await LocalNotifications.requestPermissions();
    }
    if (permStatus.display === 'granted') {
        console.log("Permissions de notification accordées.");
        return true;
    } else {
        console.warn("Permissions de notification refusées.");
        return false;
    }
}
