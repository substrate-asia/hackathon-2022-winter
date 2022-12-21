import React, { useState, useEffect, useContext } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import myContext from "./createContext";
import { Link } from "react-router-dom";

import {
  Menu,
  Button,
  Dropdown,
  Container,
  Icon,
  Image,
  Label,
} from "semantic-ui-react";

import { useSubstrate, useSubstrateState } from "./substrate-lib";

const CHROME_EXT_URL =
  "https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd";
const FIREFOX_ADDON_URL =
  "https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/";

const acctAddr = (acct) => (acct ? acct.address : "");

function Main(props) {
  const {
    setCurrentAccount,
    state: { keyring, currentAccount },
  } = useSubstrate();

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map((account) => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: "user",
  }));

  const initialAddress =
    keyringOptions.length > 0 ? keyringOptions[0].value : "";

  // Set the initial address
  useEffect(() => {
    // `setCurrentAccount()` is called only when currentAccount is null (uninitialized)
    !currentAccount &&
      initialAddress.length > 0 &&
      setCurrentAccount(keyring.getPair(initialAddress));
  }, [currentAccount, setCurrentAccount, keyring, initialAddress]);

  const onChange = (addr) => {
    setCurrentAccount(keyring.getPair(addr));
  };
  // const [val, setval] = useState("");
  const val = useContext(myContext);
  console.log(val);
  return (
    <Menu
      // attached="top"
      tabular
      style={{
        backgroundColor: "#000",
        backgroundSize: "100% 100%",
        backgroundImage:
          "url(" + `${process.env.PUBLIC_URL}/assets/headbg.png` + ")", //图片的路径
        // borderColor: "#fff",
        // paddingTop: "1em",
        // paddingBottom: "1em",
        borderBottom: "0",
        width: "100%",
        height: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", //中间留白
        marginBottom: "0",
      }}
    >
      <Container
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", //中间留白
        }}
      >
        <Menu.Menu>
          <Link to="/">
            <Image
              src={`${process.env.PUBLIC_URL}/assets/Cicada.png`}
              style={{
                width: "163px",
                height: "35px",
              }}
            />
            <div
              style={{
                fontSize: "17px",
                fontFamily: "Arial",
                fontWeight: "400",
                color: " #FFFFFF",
              }}
            >
              Let people learn blockchain easily
            </div>
          </Link>
        </Menu.Menu>
        <Menu.Menu>
          <div
            class="ui action input"
            style={{
              width: "451px",
              height: "60px",
              marginLeft: "40px",
            }}
          >
            <input
              type="text"
              placeholder="Search blockchain knowledge based on subject"
              value={val}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            />
            <button
              class="ui icon button"
              style={{
                width: "110px",
                height: "60px",
                backgroundColor: "#FFE178",
                fontSize: "21px",
                fontFamily: "Arial",
                fontWeight: "400",
                color: "#091323",
                lineHeight: "60px",
              }}
            >
              <i
                class="search icon"
                style={{
                  fontSize: "21px",
                  lineHeight: "20px",
                }}
              ></i>
              <span>Search</span>
            </button>
          </div>
        </Menu.Menu>

        <Menu.Menu position="right" style={{ alignItems: "center" }}>
          {!currentAccount ? (
            <span>
              Create an account with Polkadot-JS Extension (
              <a target="_blank" rel="noreferrer" href={CHROME_EXT_URL}>
                Chrome
              </a>
              ,&nbsp;
              <a target="_blank" rel="noreferrer" href={FIREFOX_ADDON_URL}>
                Firefox
              </a>
              )&nbsp;
            </span>
          ) : null}
          <CopyToClipboard text={acctAddr(currentAccount)}>
            <Button
              basic
              circular
              size="large"
              icon="user"
              color={currentAccount ? "green" : "red"}
            />
          </CopyToClipboard>
          <Dropdown
            search
            selection
            clearable
            placeholder="Select an account"
            options={keyringOptions}
            onChange={(_, dropdown) => {
              onChange(dropdown.value);
            }}
            value={acctAddr(currentAccount)}
          />
          <BalanceAnnotation />
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

function BalanceAnnotation(props) {
  const { api, currentAccount } = useSubstrateState();
  const [accountBalance, setAccountBalance] = useState(0);

  // When account address changes, update subscriptions
  useEffect(() => {
    let unsubscribe;

    // If the user has selected an address, create a new subscription
    currentAccount &&
      api.query.system
        .account(acctAddr(currentAccount), (balance) =>
          setAccountBalance(balance.data.free.toHuman())
        )
        .then((unsub) => (unsubscribe = unsub))
        .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api, currentAccount]);

  return currentAccount ? (
    <Label pointing="left">
      <Icon name="money" color="green" />
      {accountBalance}
    </Label>
  ) : null;
}

export default function AccountSelector(props) {
  const { api, keyring } = useSubstrateState();
  return keyring.getPairs && api.query ? <Main {...props} /> : null;
}
