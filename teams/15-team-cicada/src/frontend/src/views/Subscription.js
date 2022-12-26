import React, { useEffect, useState } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";
import { Button, notification, Space, Modal, Spin } from "antd";
import { Editor } from "react-draft-wysiwyg";

import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

import {
  Form,
  Input,
  Grid,
  Label,
  Icon,
  Dropdown,
  TextArea,
} from "semantic-ui-react";
import { useSubstrateState } from "../substrate-lib";
import { CicadaApi } from "../cicada-lib/index";
import "../../src/css/index.css";
export default function Main(props) {
  const [cicadaState, setCicadaState] = useState({
    categoryName: "",
    categoryParent:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    categoryHash: "",
    active: 1,
    isModal: false,
    labelName: "",
    labelHash: "",
    isLoading: false, //控制显示隐藏加载
    subjectName: "",
    subjectHash: "",
    list: ["Create Subject", "Select Category", "Edit Content"],
    dimensionName: "维度1",
    dimensionHash: "",
    content: "这是一篇测试内容",
    contentHash: "",
    categoryList: [
      "Math",
      "Science",
      "History",
      "Business",
      "Arts &  Humanities",
      "Social Studies",
      "Engineering &  Technology",
      "Hobbies",
      "Arts &  Entertainment",
      "Sciences",
      "Humanities",
      "Sports",
      "Books and  Literature",
      "Electronics",
      "Other",
    ],
  });
  const { api, currentAccount } = useSubstrateState();
  const cicadaApi = new CicadaApi(currentAccount, api);
  //   const onChange = (_, data) =>
  //     setCicadaState((prev) => ({ ...prev, [data.state]: data.value }));
  let history = useHistory();
  let {
    isLoading,
    categoryName,

    categoryList,
    active,
  } = cicadaState;

  const { keyring } = useSubstrateState();
  const accounts = keyring.getPairs();

  const availableAccounts = [];

  accounts.map((account) => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    });
  });

  return (
    <Spin spinning={isLoading} tip="Loading......" size="large">
      <Grid.Column width={8}>
        <div style={{ minHeight: "700px" }}>
          {/* 创建二 */}
          <div style={{ display: active == 2 ? "block" : "none" }}>
            <div className="categoryList">
              {categoryList.map((i) => (
                <div
                  className={
                    i == categoryName ? "category active_category" : "category"
                  }
                  onClick={() => clickCategory(i)}
                >
                  {i}
                </div>
              ))}
            </div>

            <div
              className="btnStyle"
              onClick={function () {
                setCicadaState((prev) => ({
                  ...prev,
                  isLoading: 1,
                }));
              }}
            >
              CREATE
            </div>
          </div>
        </div>
      </Grid.Column>
    </Spin>
  );
}
