import { FC, PropsWithChildren } from "react";
import "./styles.scss";

type Props = {
  children: PropsWithChildren<any>;
};

const SafeAreaView: FC<Props> = ({ children }) => {
  return <div className="safe-area-view">{children}</div>;
};

export default SafeAreaView;
