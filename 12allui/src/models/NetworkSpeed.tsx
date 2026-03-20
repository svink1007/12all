import axios from 'axios';

export default class NetworkSpeed {
  private static readonly CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+`-=[]{}|;\':,./<>?';
  private static testData = '';

  static async getNetworkUploadSpeed(fileSizeInBytes: number, upSpeedUrl: string) {
    const data = this.testData || this.generateTestData(fileSizeInBytes);
    const startTime = new Date().getTime();
    await axios.post(upSpeedUrl, {data});
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;
    const bitsLoaded = fileSizeInBytes * 8;
    const bps = +(bitsLoaded / duration).toFixed(2);
    const kbps = +(bps / 1000).toFixed(2);
    const mbps = +(kbps / 1000).toFixed(2);

    return {mbps};
  };

  private static generateTestData(size: number) {
    for (let index = 0; index < size; index++) {
      this.testData += this.CHARS.charAt(Math.floor(Math.random() * this.CHARS.length));
    }
    return this.testData;
  };
}
