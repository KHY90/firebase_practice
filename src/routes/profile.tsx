import { styled } from "styled-components";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;

const AvatarInput = styled.input`
  display: none;
`;

const Name = styled.span`
  font-size: 22px;
`;

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const EditNameButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 22px;
  height: 22px;

  svg {
    width: 100%;
    height: 100%;
    stroke: white;
  }
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [avatar, setAvatar] = useState(currentUser?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [name, setName] = useState(currentUser?.displayName ?? "Anonymous");

  // Auth 상태 변경 감지: 사용자가 로그인되면 상태 업데이트 및 트윗 불러오기
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setAvatar(user.photoURL);
        setName(user.displayName || "Anonymous");
        fetchTweets(user);
      }
    });
    return unsubscribe;
  }, []);

  // 아바타 변경: data URL로 변환하여 업데이트
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!currentUser) return;
    if (files && files.length === 1) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setAvatar(dataUrl);
        await updateProfile(currentUser, {
          photoURL: dataUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 현재 사용자의 트윗 데이터를 Firestore에서 가져오기
  const fetchTweets = async (user: any) => {
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(tweetQuery);
    const tweetsData = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      };
    });
    setTweets(tweetsData);
  };

  // 이름 수정 메서드
  const onEditName = async () => {
    if (!currentUser) return;
    const newName = prompt("새로운 이름을 입력하세요.", name);
    if (newName && newName !== name) {
      try {
        await updateProfile(currentUser, { displayName: newName });
        setName(newName);
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
          </svg>
        )}
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      <NameWrapper>
        <Name>{name}</Name>
        <EditNameButton onClick={onEditName}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </EditNameButton>
      </NameWrapper>
      <Tweets>
        {tweets.length > 0 ? (
          tweets.map((tweet) => <Tweet key={tweet.id} {...tweet} />)
        ) : (
          <p>등록된 트윗이 없습니다.</p>
        )}
      </Tweets>
    </Wrapper>
  );
}
