import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div`
  &:last-child {
    place-self: end;
  }
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 30px;
`;

const EditButton = styled.button`
  background-color: steelblue;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px; /* 버튼 간 간격 추가 */
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  
  // 삭제
  const onDelete = async () => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok || user?.uid !== userId) return;
    try {
      // Storage 관련 삭제 코드 제거 → Firestore의 해당 문서만 삭제됩니다.
      await deleteDoc(doc(db, "tweets", id));
    } catch (e) {
      console.log(e);
    }
  };

  // 수정
  const onEdit = async () => {
    if (user?.uid !== userId) return;
    const newTweet = prompt("수정할 내용을 입력해주세요.", tweet);
    if (newTweet === null || newTweet === tweet) return;
    try {
      await updateDoc(doc(db, "tweets", id), { tweet: newTweet });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{tweet}</Payload>
        {user?.uid === userId ? (
          <>
            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
            <EditButton onClick={onEdit}>Edit</EditButton>
          </>
        ) : null}
      </Column>
      <Column>{photo ? <Photo src={photo} /> : null}</Column>
    </Wrapper>
  );
}
