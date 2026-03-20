import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IonContent, IonImg, IonPage } from "@ionic/react";

import "./styles.scss";

import Close from "../../images/users/close.svg";
import Search from "../../images/users/search.svg";
import TriUp from "../../images/users/tri up.svg";
import TriDown from "../../images/users/tri down.svg";

import { UserItemProps } from "../../components/UserItem";
import UserItems from "../../components/UserItems";
import { useHistory } from "react-router";
import SafeAreaView from "../../components/SafeAreaView";

type CollapseContainerProps = {
  total?: number;
  children?: React.ReactNode;
  title?: string;
  data?: UserItemProps[];
  className?: string;
};

const CollapseContainer: React.FC<CollapseContainerProps> = (props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [animationClass, setAnimationClass] = useState("content-enter");

  const onCollapse = () => {
    if (isOpen) {
      setAnimationClass("content-exit");
      setTimeout(() => setIsOpen(false), 500); // Wait for animation to finish
    } else {
      setIsOpen(true);
      setAnimationClass("content-enter");
    }
  };

  return (
    <div className={`collapse-container ${props.className ?? ""}`}>
      <div className="collapse-icon-header" onClick={onCollapse}>
        <IonImg src={isOpen ? TriDown : TriUp} className="tridown" />
        <p>
          {props.title} ({props.total})
        </p>
      </div>
      <hr />
      {isOpen && <div className={animationClass}>{props.children}</div>}
    </div>
  );
};

const Users = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [friends, setFriends] = useState([
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
  ]);
  const [allUsers, setAllUsers] = useState([
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
  ]);
  const [topUsers, setTopUsers] = useState([
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
  ]);
  const [contacts, setContacts] = useState([
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
    {
      username: "UAMaksimUA",
      stars: 250,
      league: "bronze",
      namespace: "@nameuser",
      selected: false,
    },
  ]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [category, setCategory] = useState<string>(t("users.one2all"));

  useEffect(() => {
    setSelectedCount(
      category === t("users.one2all")
        ? countSelected(allUsers)
        : category === t("users.topUsers")
          ? countSelected(topUsers)
          : countSelected(contacts)
    );
  }, [category, friends, allUsers, topUsers, contacts]);

  const onCategoryHandle = (value: string) => {
    setCategory(value);
  };

  const onSelect = (data: UserItemProps[], setData: any, index: number) => {
    let newData = [...data];
    newData[index].selected = !newData[index].selected;
    setData(newData);
  };

  const countSelected = (data: UserItemProps[]) => {
    let count = data.filter((item) => item.selected).length;
    return count;
  };

  const handleSearchInputChange = () => {};

  const onClose = () => {
    history.goBack();
  };

  const onAddFriendsClick = () => {
    if (selectedCount > 0) {
    }
  };

  return (
    <IonPage>
      <IonContent>
        <SafeAreaView>
          <div className="users-page-container">
            <div className="header">
              <IonImg src={Close} className="close-btn" onClick={onClose} />
              <p>{t("users.users")}</p>
            </div>
            <div className="content">
              <div className="category-container">
                <div
                  className={`category-item ${
                    category === t("users.one2all") ? "active" : ""
                  }`}
                  onClick={() => onCategoryHandle(t("users.one2all"))}
                >
                  {t("users.one2all")}
                </div>
                <div
                  className={`category-item ${
                    category === t("users.topUsers") ? "active" : ""
                  }`}
                  onClick={() => onCategoryHandle(t("users.topUsers"))}
                >
                  {t("users.topUsers")}
                </div>
                <div
                  className={`category-item ${
                    category === t("users.contacts") ? "active" : ""
                  }`}
                  onClick={() => onCategoryHandle(t("users.contacts"))}
                >
                  {t("users.contacts")}
                </div>
              </div>

              <div className="input-area">
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Search Friends and Contacts"
                    onChange={handleSearchInputChange}
                  />
                  <div className="search-icon">
                    <IonImg src={Search} />
                  </div>
                </div>
              </div>

              <div className="users-list-container">
                {category === t("users.one2all") ? (
                  <>
                    <CollapseContainer
                      title="Friends"
                      total={friends.length}
                      className="friends-container"
                    >
                      <UserItems
                        data={friends}
                        setData={setFriends}
                        onSelect={onSelect}
                      />
                    </CollapseContainer>

                    <CollapseContainer
                      title="Connect on One2 all"
                      total={allUsers.length}
                      className="friends-container"
                    >
                      <UserItems
                        data={allUsers}
                        setData={setAllUsers}
                        onSelect={onSelect}
                      />
                    </CollapseContainer>
                  </>
                ) : category === t("users.topUsers") ? (
                  <>
                    <CollapseContainer
                      title="Top Users"
                      total={topUsers.length}
                      className="friends-container"
                    >
                      <UserItems
                        data={topUsers}
                        setData={setTopUsers}
                        onSelect={onSelect}
                      />
                    </CollapseContainer>
                  </>
                ) : (
                  <>
                    <CollapseContainer
                      title="Contacts"
                      total={contacts.length}
                      className="friends-container"
                    >
                      <UserItems
                        data={contacts}
                        setData={setContacts}
                        onSelect={onSelect}
                      />
                    </CollapseContainer>
                  </>
                )}
              </div>

              <div
                className={`add-friend-button-container ${
                  !selectedCount ? "disabled" : ""
                }`}
                onClick={onAddFriendsClick}
              >
                Add {selectedCount} friends
              </div>
            </div>
          </div>
        </SafeAreaView>
      </IonContent>
    </IonPage>
  );
};

export default Users;
