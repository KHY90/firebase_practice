import {
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
  } from "firebase/firestore";
  import { useEffect, useState } from "react";
  import { styled } from "styled-components";
  import { db } from "../firebase";
  import Tweet from "./tweet";
  import { Unsubscribe } from "firebase/auth";
  
  export interface ITweet {
    id: string;
    photo?: string;
    tweet: string;
    userId: string;
    username: string;
    createdAt: number;
  }
  
  const Wrapper = styled.div`
    display: flex;
    gap: 10px;
    flex-direction: column;
    /* 필요에 따라 높이나 overflow-y를 추가 */
    overflow-y: auto;
  `;
  
  export default function Timeline() {
    const [tweets, setTweet] = useState<ITweet[]>([]);
  
    useEffect(() => {
      let unsubscribe: Unsubscribe | null = null;
      // -> 기본값을 null로 설정, 마운트 되는 동안은 null, 언마운트 시 Unsubscribe 호출
  
      const fetchTweets = async () => {
        const tweetsQuery = query(
          collection(db, "tweets"),
          orderBy("createdAt", "desc"),
          limit(25)
        );
        unsubscribe = onSnapshot(tweetsQuery, (snapshot) => {
          const tweets = snapshot.docs.map((doc) => {
            const data = doc.data();
            let photoUrl: string | undefined;
            if (data.photo) {
              if (typeof data.photo === "string") {
                // 이미 문자열 형태라면 그대로 사용
                photoUrl = data.photo;
              } else if (
                // Firestore Bytes 객체는 toUint8Array 함수가 있음
                data.photo.toUint8Array &&
                typeof data.photo.toUint8Array === "function"
              ) {
                const uint8Array = data.photo.toUint8Array();
                const blob = new Blob([uint8Array], { type: "image/jpeg" });
                photoUrl = URL.createObjectURL(blob);
              }
            }
            return {
              tweet: data.tweet,
              createdAt: data.createdAt,
              userId: data.userId,
              username: data.username,
              photo: photoUrl,
              id: doc.id,
            };
          });
          setTweet(tweets);
        });
      };
  
      fetchTweets();
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
        // cleanup function : 해당 컴포넌트가 언마운트 될 때 구독 취소
      };
    }, []);
  
    return (
      <Wrapper>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Wrapper>
    );
  }  