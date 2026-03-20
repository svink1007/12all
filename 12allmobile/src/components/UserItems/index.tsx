import React from "react";
import { UserItemProps } from "../UserItem";
import UserItem from "../UserItem";
import "./styles.scss";

type UserItemsProps = {
  data: UserItemProps[];
  setData: any;
  onSelect: (data: UserItemProps[], setData: any, index: number) => void;
};

const UserItems: React.FC<UserItemsProps> = ({ data, setData, onSelect }) => {
  return (
    <div className="user-items-container">
      {data.map((item, index) => (
        <UserItem
          {...item}
          onSelect={() => {
            onSelect(data, setData, index);
          }}
          key={item.username + index}
        />
      ))}
    </div>
  );
};

export default UserItems;
