export enum Routes {
  Home = "/home",
  About = "/about",
  Downloads = "/downloads",
  News = "/news",
  Stars = "/stars",
  InviteAndWin = "/invite-an-win",
  howToWin = "/how-to-win",
  Shop = "/shop",
  StarsStatusTable = "/stars-status",
  TopUp = "/top-up",
  CashOut = "/cash-out",
  StarsTransaction= "/stars-transaction",
  Premium = "/premium",
  PremiumViewer = "/premium-viewer",
  PremiumHost = "/premium-host",
  NewsId = '/news/:id',
  Careers = "/careers",
  Support = "/support",
  // ContactUs = "/contact-us",

  WatchParty = "/watch-party",
  WatchPartyStart = "/watch-party/start",
  WatchPartyStart1 = "/watch-party/start/1",
  WatchPartyStart2 = "/watch-party/start/2",
  WatchPartyStartRoom = "/watch-party/start/room",

  WatchPartyRoomId = "/watch-party/:id",
  WatchPartyRoomIdMediator = "/watch-party/:id/m",

  WatchPartyJoin = "/watch-party/join",
  WatchPartyJoinRoom = "/watch-party/join/room",

  Stream = "/stream",
  StreamId = "/stream/:id",
  StreamIdTv = "/tvStream/:id", // added
  StreamIdRoom = "/stream/:id/:roomId",
  StreamIdRoomTv = "/tvStream/:id/:roomId", // added
  StreamCamera = "/stream/camera",

  SharedSites = '/shared-sites',

  Login = "/login",
  Skip = "/skip",
  SignUp = "/signup",
  Notifications = "/notifications",
  PrivacyPolicy = "/privacy-policy",
  ChildSafety = "/child-safety",
  TermsAndConditions = "/terms-and-conditions",
  MyProfile = "/my-profile",
  MyVoD = "/my-vod",
  SearchVoD = "/search-vod",
  MyChannel = "/my-channel",
  AccountStatus = "/account-status",
  HowToDeleteYourData = "/how-to-delete-your-data",
  Career = '/career/:id',

  YouTubeChannel = 'https://www.youtube.com/channel/UCRX7vk6qh5T5uWbQfXqJ18A',
  RedditChannel = 'https://www.reddit.com/user/12ALL_TV/',

  Room = '/room',
  RoomHome = '/room/home',
  RoomTest = '/room/test',

  StreamTest = '/stream-test',

  ResetPassword = '/reset-password',
  resetCode = '/reset-code',
  changePassword = '/change-password',

  Favorites = '/favorites',
  Rooms = '/rooms',
  Vods = '/video-on-demand',
  VodRoom = '/vod/:id',
  VodRoomX = '/vodx/:id',
  Vod = '/vod',
  
  VodChannel = '/vod-channel',
  VodRoomChannel = '/vod-channel/:channelId?/vod/:vodId?',

  Channels = '/channels',
  Search = '/search',
  Genre = '/genre',
  SignupReward = '/signup-reward'
}
