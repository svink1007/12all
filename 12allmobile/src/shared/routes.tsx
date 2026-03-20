export enum Routes {
  Home = "/home",
  Login = "/login",
  CodeProvider = "/code-provider",
  Code = "/code",
  Profile = "/profile",
  Broadcasts = "/broadcasts",
  Stream = "/stream",
  WatchParty = "/watch-party",
  Users = "/users",
  SKIP = "/skip",

  Privacy = "/privacy",
  Terms = "/terms",
  About = "/about",
  ShowContacts = "/contacts",

  WatchPartyJoin = "/watch-party",
  ProtectedWatchPartyJoin = "/protected/watch-party",
  ProtectedWatchPartyJoinId = "/protected/watch-party/:id",

  ProtectedWatchPartyRoom = "/protected/watch-party/room",
  ProtectedWatchPartyRoomId = "/protected/watch-party/room/:id",

  ProtectedStream = "/protected/stream",
  ProtectedStreamId = "/protected/stream/:id",
  ProtectedStreamIdRoom = "/protected/stream/:id/:roomId",
  ProtectedStreamCamera = "/protected/stream/camera",

  VodChannel = "/vod-channel",
  VodChannelId = "/vod-channel/vod/:id",

  ProtectedSharedSites = "/protected/shared-sites",

  ProtectedCreateRoom = "/protected/create-room",
  ProtectedSettings = "/protected/settings",
  ProtectedRoomSettings = "/protected/room/settings",
  ProtectedStarsTransactions = "/protected/stars-transactions",
  ProtectedBillingHistory = "/protected/billing-history",
  ProtectedAccountBalance = "/protected/account-balance",
  ProtectedDeleteProfile = "/protected/delete-profile",
  ProtectedTopUp = "/protected/billing/top-up",
  ProtectedCashOut = "/protected/billing/cash-out",
  ProtectedInviteAndWin = "/protected/billing/invite-and-win",
  ProtectedBillingInfo = "/protected/billing/billing-info",

  Premium = "/premium",
}
