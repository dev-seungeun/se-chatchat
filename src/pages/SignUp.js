import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signUp } from "../helpers/auth";
import "../signup.css"

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleOnChange = (e) => {
    const type = e.target.name;
    if(type === "email") {
      setEmail(e.target.value);
    }else if(type === "password") {
      setPassword(e.target.value);
    }
  };

  const handleOnSubmit = async(e) => {
    e.preventDefault();
    if(email !== "" && password !== "") {
      try {
        await signUp(email, password);
      }catch(error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="signup-wrap">
      <div className="sign-up-wrap">
        <h1 className="title">회원가입</h1>
        <form className="sign-up-form" onSubmit={handleOnSubmit}>
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
            <button className="signup" type="submit">회원가입</button>
          </div>
        </form>
        <hr></hr>
        <p>
          <div className="login-text">이미 회원이신가요? <Link to="/login">로그인</Link></div>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
