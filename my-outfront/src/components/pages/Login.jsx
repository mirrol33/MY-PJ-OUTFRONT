// ./src/components/pages/Login.jsx

import React, { useContext, useEffect, useState } from "react";
import "../../scss/pages/join.scss";
import { initData } from "../../js/func/mem_fn";
import { dCon } from "../modules/dCon";

function Login() {
  const myCon = useContext(dCon);
  console.log("로그인페이지 dCon:", myCon);

  // 상태관리 변수
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const [userIdError, setUserIdError] = useState(false);
  const [pwdError, setPwdError] = useState(false);

  // 메시지 프리셋
  const msgId = ["아이디를 입력해주세요.", "존재하지 않는 아이디입니다."];

  const msgPwd = ["비밀번호를 입력해주세요.", "비밀번호가 일치하지 않습니다."];

  // 에러 메시지 상태 변수
  const [idMsg, setIdMsg] = useState(msgId[0]);
  const [pwdMsg, setPwdMsg] = useState(msgPwd[0]);

  // 아이디 유효성 검사
  const changeUserId = (e) => {
    const val = e.target.value;
    setUserId(val);

    if (val) {
      setUserIdError(false);
      // setIdMsg(msgId[2]); // 아이디 확인 메시지
    } else {
      setIdMsg(msgId[0]);
      setUserIdError(true);
    }
  };

  // 비밀번호 유효성 검사
  const changePwd = (e) => {
    const val = e.target.value;
    setPwd(val);

    if (val) {
      setPwdError(false);
    } else {
      setPwdMsg(msgPwd[0]);
      setPwdError(true);
    }
  };

  // 전체 유효성 검사
  const totalValid = () => {
    if (!userId) setUserIdError(true);
    if (!pwd) setPwdError(true);
    return userId && pwd && !userIdError && !pwdError;
  };

  // 서밋 기능
  const onSubmit = (e) => {
    e.preventDefault();
    console.log("최종검사:", totalValid());

    if (totalValid()) {
      console.log("아이디/패스워드 부합");
      initData();

      let memData = JSON.parse(localStorage.getItem("mem-data"));
      console.log(memData);

      const result = memData.find((v) => v.uid === userId);
      console.log("로그인 정보", result);

      if (!result) {
        setIdMsg(msgId[1]);
        setUserIdError(true);
      } else {
        setUserIdError(false);
        if (pwd === result.pwd) {
          sessionStorage.setItem("minfo", JSON.stringify(result));
          // myCon.setLoginSts(sessionStorage.getItem("minfo"));
          myCon.setLoginSts(result);
          myCon.makeMsg(result.unm);
          /////////// 추가 코드 //////////// 
          console.log(myCon.loginSts);
          document.querySelector(".log-submit").innerText = "아웃프런에 오신 것을 환영합니다 🎉";

          setTimeout(() => {
            myCon.goPage("/mypage");
          }, 1000);
        } else {
          setPwdMsg(msgPwd[1]);
          setPwdError(true);
        }
      }
    } else {
      alert("아이디 / 비밀번호를 확인해주세요.");
    }
  };

  // 컴포넌트가 마운트될 때 아이디 입력창 포커스
  useEffect(() => {
    document.querySelector("#user-id").focus();
  }, []);

  // 렌더링
  return (
    <div className="join-page login-wrap">
      <div className="join-top">
        <h2 className="join-title">로그인</h2>
      </div>
      <form className="join-form" onSubmit={onSubmit}>
        <ul>
          <li className="join-id">
            <label>아이디</label>
            <input
              id="user-id"
              type="text"
              maxLength="15"
              placeholder="아이디를 입력하세요."
              value={userId}
              onChange={changeUserId}
            />
            {userIdError && (
              <div className="msg">
                <small style={{ color: "#fe5b16" }}>{idMsg}</small>
              </div>
            )}
          </li>
          <li>
            <label>비밀번호</label>
            <input
              type="password"
              maxLength="20"
              placeholder="비밀번호를 입력하세요."
              value={pwd}
              onChange={changePwd}
            />
            {pwdError && (
              <div className="msg">
                <small style={{ color: "#fe5b16" }}>{pwdMsg}</small>
              </div>
            )}
          </li>
          <li style={{ overflow: "hidden" }}>
            <button className="log-submit" type="submit" onClick={onSubmit}>
              로그인하기
            </button>
          </li>
        </ul>
      </form>
    </div>
  );
}

export default Login;
