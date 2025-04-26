import React, { useState } from "react";
import "../../scss/pages/join.scss";
import { Link, useNavigate } from "react-router-dom";
import { initData } from "../../js/func/mem_fn";

function Join() {
  const goPage = useNavigate();

  // 상태 관리 변수
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const [chkPwd, setChkPwd] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  // 에러 상태 관리 변수
  const [userIdError, setUserIdError] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [chkPwdError, setChkPwdError] = useState(false);
  const [userNameError, setUserNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // 버튼 유효성 상태 변수
  const [isValid, setIsValid] = useState(false);

  // 메시지 정의
  const msgId = [
    "영문 5글자 이상으로 입력해주세요.",
    "이미 사용중인 아이디입니다.",
    "좋은 아이디입니다👏 아웃프런과 함께해요",
  ];

  const msgEtc = {
    pwd: "영문, 숫자, 특수문자를 포함한 5자 이상이어야 합니다.",
    confPwd: "비밀번호가 일치하지 않습니다. 다시 입력해주세요.",
    req: "필수 항목을 모두 입력해야 합니다.",
    email: "이메일 형식이 잘못되었습니다",
  };

  // 아이디 메시지 상태 변수
  const [idMsg, setIdMsg] = useState(msgId[0]);

  // 아이디 유효성 검사
  const changeUserId = (e) => {
    const val = e.target.value;
    const valid = /^[A-Za-z0-9+]{5,}$/;
    setUserId(val);
    validateFields();

    if (valid.test(val)) {
      initData();
      let memData = JSON.parse(localStorage.getItem("mem-data") || "[]");
      const isT = memData.some((v) => v.uid === val);

      if (isT) {
        setIdMsg(msgId[1]);
        setUserIdError(true);
      } else {
        setUserIdError(false);
        setIdMsg(msgId[2]); // 성공 메시지
      }
    } else {
      setIdMsg(msgId[0]);
      setUserIdError(true);
    }

    setUserId(val);
    validateFields();
  };

  // 비밀번호 유효성 검사
  const changePwd = (e) => {
    const val = e.target.value;
    const valid = /^.*(?=^.{5,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;

    setPwdError(!valid.test(val));
    setPwd(val);
    validateFields();
  };

  // 비밀번호 확인 유효성 검사
  const changeChkPwd = (e) => {
    const val = e.target.value;
    setChkPwdError(pwd !== val);
    setChkPwd(val);
    validateFields();
  };

  // 사용자 이름 유효성 검사
  const changeUserName = (e) => {
    const val = e.target.value;
    setUserNameError(val === "");
    setUserName(val);
    validateFields();
  };

  // 이메일 유효성 검사
  const changeEmail = (e) => {
    const val = e.target.value;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(!valid.test(val));
    setEmail(val);
    validateFields();
  };

  // 전체 유효성 검사
  const validateFields = () => {
    const valid =
      userId &&
      pwd &&
      chkPwd &&
      userName &&
      email &&
      !userIdError &&
      !pwdError &&
      !chkPwdError &&
      !userNameError &&
      !emailError;

    setIsValid(valid); // 유효성 상태 업데이트
    console.log("Is valid:", valid); // 유효성 상태 로그 출력
  };

  // 서브밋 기능
  const onSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      // isValid를 함수처럼 호출하지 않고, 상태 변수로 사용합니다.
      initData();
      let memData = JSON.parse(localStorage.getItem("mem-data") || "[]");
      let newData = {
        idx: (memData.length > 0 ? Math.max(...memData.map((v) => v.idx)) : 0) + 1,
        uid: userId,
        pwd: pwd,
        unm: userName,
        eml: email,
      };

      memData.push(newData);
      localStorage.setItem("mem-data", JSON.stringify(memData));

      document.querySelector(".submit").innerText = "아웃프런과 함께해요 👏";
      setTimeout(() => {
        goPage("/login");
      }, 1000);
    } else {
      alert("🚨필수 입력사항을 확인해주세요🚨");
    }
  };

  return (
    <div className="join-page">
      <div className="join-top">
        <h2 className="join-title">회원가입</h2>
      </div>

      <form onSubmit={onSubmit} className="join-form">
        <ul>
          <li className="join-id">
            <label>아이디</label>
            <input
              type="text"
              maxLength="15"
              placeholder="아이디를 입력하세요"
              value={userId}
              onChange={changeUserId}
            />
            {userIdError && (
              <div className="msg" style={{ color: "#fe5b16" }}>
                {idMsg}
              </div>
            )}
            {!userIdError && userId && (
              <div className="msg" style={{ color: "#00c471" }}>
                {msgId[2]}
              </div>
            )}
          </li>
          <li className="join-pass">
            <label>비밀번호</label>
            <input
              type="password"
              maxLength="20"
              placeholder="비밀번호를 입력하세요"
              value={pwd}
              onChange={changePwd}
            />
            {pwdError && (
              <div className="msg" style={{ color: "#fe5b16" }}>
                {msgEtc.pwd}
              </div>
            )}
          </li>
          <li className="join-pass-confirm">
            <label>비밀번호 확인</label>
            <input
              type="password"
              maxLength="20"
              placeholder="비밀번호를 다시 입력하세요"
              value={chkPwd}
              onChange={changeChkPwd}
            />
            {chkPwdError && (
              <div className="msg" style={{ color: "#fe5b16" }}>
                {msgEtc.confPwd}
              </div>
            )}
          </li>
          <li className="join-name">
            <label>이름</label>
            <input
              type="text"
              maxLength="8"
              placeholder="성함을 입력하세요"
              value={userName}
              onChange={changeUserName}
            />
            {userNameError && (
              <div className="msg" style={{ color: "#fe5b16" }}>
                {msgEtc.req}
              </div>
            )}
          </li>
          <li className="join-name">
            <label>이메일</label>
            <input type="text" maxLength="50" placeholder="이메일을 입력하세요" value={email} onChange={changeEmail} />
            {emailError && (
              <div className="msg" style={{ color: "#fe5b16" }}>
                {msgEtc.email}
              </div>
            )}
          </li>
          <li>
            <button type="submit" className={`submit ${isValid ? "valid" : ""}`}>
              가입하기
            </button>
          </li>
          <ul className="join-already">
            <li>이미 회원이신가요?</li>
            <li>
              <Link to="/login">로그인하기</Link>
            </li>
          </ul>
        </ul>
      </form>
    </div>
  );
}

export default Join;
