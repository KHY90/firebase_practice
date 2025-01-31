import React, { useState } from "react";
import { useNavigate, Link, Form } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Error, Input, Switcher, Title, Wrapper } from "../components/auth-components";

export default function CreateAccount() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("")
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { name, value } } = e;
        if (name === "password") {
            setPassword(value)
        } else if (name === "email") {
            setEmail(value)
        }
    };
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if (isLoading || email === "" || password === "")
            return;
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (e) {
            if(e instanceof FirebaseError){
                setError(e.message)
            }
        } finally {
            setLoading(false);
        }
    };

    return (
    <Wrapper>
        <Title>✖️ 로그인</Title>
        <Form onSubmit={onSubmit}>
            <Input onChange={onChange} name="email" value={email} placeholder="이메일" type="email" required />
            <Input onChange={onChange} name="password" value={password} placeholder="비밀번호" type="password" required />
            <Input type="submit" value={isLoading ? "Loading..." : "로그인"} />
        </Form>
        {error !== "" ? <Error>{error}</Error> : null}
        <Switcher>
            아직 계정이 없으신가요?{" "}
             <Link to="/create-account">
                Create &rarr;
             </ Link>
        </Switcher>
    </Wrapper>
    );
}