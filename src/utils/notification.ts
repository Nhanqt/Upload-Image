import axios from 'axios';
export class Notification {
  async notification(expoPushToken, title, body) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
    };
    axios.post('https://exp.host/--/api/v2/push/send', message).catch((err) => {
      console.log(err);
    });
  }
}
