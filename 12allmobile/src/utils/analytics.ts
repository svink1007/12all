import ReactGA from "react-ga";

const TRACKING_ID = "tracking_id";

export const initGA = () => {
  ReactGA.initialize(TRACKING_ID);
};

export const trackPage = (page: any) => {
  ReactGA.set({ page });
  ReactGA.pageview(page);
};
