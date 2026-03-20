import { BillingDescription, BillingNotify } from "./types";

// Billing Description popup

export const signupBillingDescription: BillingDescription = {
  title: "CONGRATULATIONS!",
  label1: "You won",
  label2: "STARs for registering!",
  buttonName: "OK",
  billingAwardName: "SIGNUP_BILLING_AWARD"
}

export const loginBillingDescription: BillingDescription = {
  title: "WELCOME BACK",
  label1: "Here is your",
  label2: "STARS daily bonus!",
  buttonName: "OK",
  billingAwardName: "DAILY_VISIT_AWARD"
}

export const avatarBillingDescription: BillingDescription = {
  title: "CONGRATULATIONS!",
  label1: "Your very first avatar, here is",
  label2: "STARs to celebrate it!",
  buttonName: "OK",
  billingAwardName: "FIRST_AVATAR_AWARD"
}

export const firstFavoriteBillingDescription: BillingDescription = {
  title: "CONGRATULATIONS!",
  label1: "Your first favorite stream brings you",
  label2: "STARs, great job!",
  buttonName: "OK",
  billingAwardName: "FIRST_FAVORITE_AWARD"
}

export const channelCostDescription: BillingDescription = {
  title: "PAID STREAM",
  label1: "Opening this stream will cost you",
  label2: "STARS !",
  label3: "Do you want to continue?",
  buttonName: "YES",
  cancelButtonName: "NO",
  billingAwardName: "CHANNEL_COST"
}

export const paidRoomDescription: BillingDescription = {
  title: "PAID ROOM",
  label1: "Joining this room will cost you",
  label2: "STARS !",
  label3: "Do you want to continue?",
  buttonName: "YES",
  cancelButtonName: "NO",
  billingAwardName: "ROOM_COST"
}

// Billing Notification popup

export const openPaidStreamAnonDescription: BillingNotify = {
  title: "OPEN PAID STREAM",
  label: "To open this stream you have to be a registered user.",
  buttonName: "REGISTER",
  cancelButtonName: "",
  billingAwardName: "OPEN_PAID_STREAM_ANON"
}

export const openRoomAnonDescription: BillingNotify = {
  title: "CREATE ROOM",
  label: "To create a room you have to be a registered user.",
  buttonName: "REGISTER",
  cancelButtonName: "",
  billingAwardName: "OPEN_ROOM_ANON"
}

export const addGameDescription: BillingNotify = {
  title: "ADD GAME",
  label: "To add a game you have to be a registered user.",
  buttonName: "REGISTER",
  cancelButtonName: "",
  billingAwardName: "ADD_GAME_ANON"
}