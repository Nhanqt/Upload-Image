const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const LOCATE = 'vi-VN';
export class Helper {
  static convertToLocaleDateShow(date: Date): Date {
    const data = date.toLocaleString(LOCATE, {
      timeZone: TIME_ZONE,
    });
    const split = data.split(',').map((item) => item.trim());

    const time = split[0].split(':');
    const dates = split[1].split('/');
    const newDate = new Date(
      Date.UTC(
        Number(dates[2]),
        Number(Number(dates[1]) - 1),
        Number(dates[0]),
        Number(time[0]),
        Number(time[1]),
        Number(time[2]),
      ),
    );
    return newDate;
  }
  static convertToLocaleDate(date: Date): Date {
    const data = date.toLocaleString(LOCATE, {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return Helper.convertToDate(data);
  }

  static convertToDate(dateString) {
    //  Convert a "dd/MM/yyyy" string into a Date object
    const d = dateString.split('/');
    const dat = new Date(d[2] + '/' + d[1] + '/' + d[0]);
    
    return dat;
  }
}
