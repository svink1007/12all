type DownloadsStore = {
  id: number,
  logo: {
    formats: {
      thumbnail: {
        url: string
      }
    }
    url: string
  },
  name: string
};

export type DownloadsResponse = {
  id: number,
  link: string,
  store: DownloadsStore
};
