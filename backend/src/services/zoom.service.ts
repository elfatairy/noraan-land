import axios from "axios"
import { btoa } from "buffer"

export const getZoomAccessToken = async () => {
    const accessToken = await axios.post(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`, {}, {
        headers: {
            Authorization: `Basic ${btoa(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`)}`
        }
    });
    if (!accessToken.data && !accessToken.data.access_token)
        throw Error("Issue while getting access token");

    return accessToken.data.access_token
}

export const createMeeting = async (accessToken: string, name: string) => {
    const res = await axios.post(`https://api.zoom.us/v2/students/me/meetings`, {
        "agenda": name,
        "topic": name,
        "default_password": false,
        "password": "",
        "pre_schedule": false,
        "type": 1,
        "settings": {
            "auto_recording": "local"
        }
    }, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const { id, start_url } = res.data;
    return { id, start_url };
}

export const getMeeting = async (accessToken: string, meetingId: BigInt) => {
    const res = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const { join_url } = res.data;
    return { join_url };
}