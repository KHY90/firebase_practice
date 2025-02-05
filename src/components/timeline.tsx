import {
    collection,
    getDocs,
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
  `;

export default function Timeline() {
    const [tweets, setTweet] = useState<ITweet[]>([]);

    useEffect(() => {
        let unsubscribe: Unsubscribe | null = null;
        // -> 기본값을 null로 설정, 마운트 될동안은 null값, 언마운트되면 Unsubscribe
        const fetchTweets = async () => {
            const tweetsQuery = query(
                collection(db, "tweets"),
                orderBy("createdAt", "desc"),
                limit(25)
            );
            /* const spanshot = await getDocs(tweetsQuery);
              const tweets = spanshot.docs.map((doc) => {
                const { tweet, createdAt, userId, username, photo } = doc.data();
                return {
                  tweet,
                  createdAt,
                  userId,
                  username,
                  photo,
                  id: doc.id,
                };
              }); */
            unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
            // 1. onSnapshot : 특정 문서나 컬렉션, 쿼리에서 변경사항이 일어날때 실시간으로 이벤트 콜백 함수를 실행
            // unsubscribe= await onSnapshot(tweetsQuery, callback func)
            // -> 쿼리에서 이벤트 발생시 callback 함수 실행
            // 2. onSnapShot 사용시 비용을 지불(구독)해야하므로 사용자가 해당 컴포넌트를 언마운트 했을 경우 구독 취소해줘야한다. 즉 해당 컴포넌트가 마운트될때 구독되고 언마운트 될때 구독 취소해야한다. 이를위해 useEffect의 cleanup함수에 구독취소코드를 넣어준다.
                const tweets = snapshot.docs.map((doc) => {
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
                setTweet(tweets);
            });
        };
        fetchTweets();
        return () => {
            unsubscribe && unsubscribe();
        // // cleanup function : 해당 컴포넌트가 언마운트 됄때 호출
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