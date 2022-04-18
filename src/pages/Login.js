import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signIn, signInWithGoogle } from "../helpers/auth";
import "../login.css"

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleOnChange = (e) => {
    const type = e.target.name;
    if (type === "email") {
      setEmail(e.target.value);
    } else if (type === "password") {
      setPassword(e.target.value);
    }
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (email !== "" && password !== "") {
      try {
        await signIn(email, password).then((res) => console.log(res));
      } catch (err) {
        if(err.code.includes("wrong-password")) {
          alert("비밀번호를 확인해주세요.");
        }else if(err.code.includes("user-not-found")) {
          alert("이메일을 확인해주세요.");
        }else {
          alert(err.code);
        }
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
     console.log(error);
    }
  };

  return (
    <div>
      <div className="login-wrap">
        <div className="mail-wrap">
          <h1 className="title">로그인</h1>
          <br/>
          <form className="sign-form" onSubmit={handleOnSubmit}>
            <div>
              <input
                className="email"
                type="email"
                placeholder="이메일을 입력하세요."
                name="email"
                value={email}
                onChange={handleOnChange}
              />
            </div>
            <div>
              <input
                className="password"
                type="password"
                placeholder="비밀번호를 입력하세요."
                name="password"
                value={password}
                onChange={handleOnChange}
              />
            </div>
            <div>
              <button className="login" type="submit">이메일 로그인</button>
              <br/>
              <button
                className="google-login"
                type="button"
                className="sign-social-btn google-login"
                onClick={handleGoogleSignIn}
              >구글 로그인</button>
            </div>
          </form>
        </div>
      </div>
      <br/>
      <hr/>
      <div className="signup-text">회원이 아니신가요? <Link to="/signup">회원가입</Link></div>
    </div>
  );
}

export default Login;
