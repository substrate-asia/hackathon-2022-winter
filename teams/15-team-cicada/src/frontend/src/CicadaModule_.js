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
import { useSubstrateState } from "./substrate-lib";
import { CicadaApi } from "./cicada-lib/index";
import "./css/createCss.css";
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
    list: [
      "Select Category",
      "Label Name",
      "Create Subject",
      "Dimension Name",
      "Edit Content",
    ],
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
  const onChange = (_, data) =>
    setCicadaState((prev) => ({ ...prev, [data.state]: data.value }));
  let history = useHistory();
  let {
    isModal,
    isLoading,
    categoryName,
    categoryParent,
    categoryHash,
    labelName,
    labelHash,
    subjectName,
    subjectHash,
    dimensionName,
    dimensionHash,
    content,
    contentHash,
    categoryList,
    active,
    list,
  } = cicadaState;
  // 弹窗
  const showModal = () => {
    setCicadaState((el) => {
      return {
        ...el,
        content: draftToHtml(convertToRaw(editorState.getCurrentContent())),
        isModal: 1,
      };
    });
  };
  const handleOk = () => {
    setCicadaState((el) => {
      return {
        ...el,
        isModal: 0,
      };
    });
  };

  const { keyring } = useSubstrateState();
  const accounts = keyring.getPairs();

  const availableAccounts = [];

  // 文本编辑器
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
  };
  const getRichText = () => {
    const htmlStr = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setCicadaState((prev) => ({
      ...prev,
      content: htmlStr,
    }));
  };

  // 修改值
  const updateActive = (i) => {
    setCicadaState((item) => {
      console.log(item.categoryName);

      return {
        ...item,
        active: i,
      };
      // console.log(item);
    });
    active = i;
    console.log(i);
  };
  const clickCategory = (item) => {
    setCicadaState((el) => {
      return {
        ...el,
        categoryName: item,
      };
    });
  };

  useEffect(() => {
    console.log("asdasdad");

    const html = "<p>EditContent</p>";
    // 数据回显函数，将html转换为富文本文字
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      const editorState = EditorState.createWithContent(contentState);
      console.log(editorState);
      setEditorState(editorState);
    }
  }, []);

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
          {/* 圆球 */}
          <div className="threeBall">
            <div className="line"></div>
            <div className="ballBox">
              {list.map((item, i) => (
                <div>
                  <div className={active >= i + 1 ? "active_" : "no_active"}>
                    {i + 1}
                  </div>
                  <div className="ball_text">{item}</div>
                </div>
              ))}
            </div>
          </div>
          {/* 创建- 分类*/}
          <div style={{ display: active == 1 ? "block" : "none" }}>
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
            <Form.Field>
              <Label basic color="teal">
                <Icon name="hand point right" />
                categoryHase: {categoryHash}
              </Label>
            </Form.Field>
            <div
              className="btnStyle"
              onClick={function () {
                setCicadaState((prev) => ({
                  ...prev,
                  isLoading: 1,
                }));
                const processCallback = (result) => {
                  console.log(`processCallback status:${result.status}`);
                };
                const succCallback = (data) => {
                  notification.success({
                    message: "success",
                    description: `Hash:${data.data[0]}`,
                  });
                  console.log("succCallback data:", data);
                  setCicadaState((prev) => ({
                    ...prev,
                    categoryHash: data.data[0],
                    isLoading: 0,
                    active: 2,
                  }));
                };
                const failCallback = (data) => {
                  notification.error({
                    description: "come to nothing",
                  });
                  setCicadaState((prev) => ({
                    ...prev,
                    isLoading: 0,
                  }));
                  console.log("failCallback data:", data);
                };
                cicadaApi.createCategory(
                  categoryName,
                  categoryParent,
                  processCallback,
                  succCallback,
                  failCallback
                );
              }}
            >
              CREATE
            </div>
          </div>

          {/* 创建二 标签 label */}
          <div style={{ display: active == 2 ? "block" : "none" }}>
            <div>
              <input
                type="text"
                className="inputStyle"
                placeholder="Please enter label"
                value={labelName}
                state="subjectName"
                onChange={(e) => {
                  setCicadaState((prev) => ({
                    ...prev,
                    labelName: e.target.value,
                  }));
                }}
              />
            </div>
            <Form.Field style={{ marginTop: "20px" }}>
              <Label basic color="teal">
                <Icon name="hand point right" />
                labelHash: {labelHash}
              </Label>
            </Form.Field>
            <div
              className="btnStyle"
              onClick={function () {
                setCicadaState((prev) => ({
                  ...prev,
                  isLoading: 1,
                }));
                const processCallback = (result) => {
                  console.log(`processCallback status:${result.status}`);
                };
                const succCallback = (data) => {
                  notification.success({
                    message: "success",
                    description: `Hash:${data.data[0]}`,
                  });
                  console.log("succCallback data:", data);
                  setCicadaState((prev) => ({
                    ...prev,
                    labelHash: data.data[0],
                    isLoading: 0,

                    active: 3,
                  }));
                };
                const failCallback = (data) => {
                  notification.error({
                    description: "come to nothing",
                  });
                  setCicadaState((prev) => ({
                    ...prev,
                    isLoading: 0,
                  }));
                  console.log("failCallback data:", data);
                };
                cicadaApi.createLabel(
                  labelName,
                  categoryHash,
                  processCallback,
                  succCallback,
                  failCallback
                );
              }}
            >
              CREATE
            </div>
          </div>
          {/* 创建三 主题*/}
          <div style={{ display: active == 3 ? "block" : "none" }}>
            <div>
              <input
                type="text"
                className="inputStyle"
                placeholder="Subject Title Name"
                value={subjectName}
                state="subjectName"
                onChange={(e) => {
                  setCicadaState((prev) => ({
                    ...prev,
                    subjectName: e.target.value,
                  }));
                }}
              />
            </div>
            <Form.Field style={{ marginTop: "20px" }}>
              <Label basic color="teal">
                <Icon name="hand point right" />
                subjectHash: {subjectHash}
              </Label>
            </Form.Field>
            <div
              className="btnStyle"
              onClick={function () {
                setCicadaState((prev) => ({
                  ...prev,
                  isLoading: 1,
                }));
                const processCallback = (result) => {
                  console.log(`processCallback status:${result.status}`);
                };
                const succCallback = (data) => {
                  notification.success({
                    message: "success",
                    description: `Hash:${data.data[0]}`,
                  });
                  console.log("succCallback data:", data);
                  setCicadaState((prev) => ({
                    ...prev,
                    subjectHash: data.data[0],
                    isLoading: 0,
                    active: 4,
                  }));
                };
                const failCallback = (data) => {
                  notification.error({
                    description: "come to nothing",
                  });
                  setCicadaState((prev) => ({
                    ...prev,
                    isLoading: 0,
                  }));
                  console.log("failCallback data:", data);
                };
                cicadaApi.createSubject(
                  subjectName,
                  categoryHash,
                  processCallback,
                  succCallback,
                  failCallback
                );
              }}
            >
              CREATE
            </div>
          </div>

          {/* 创建4维度 */}
          <div style={{ display: active == 4 ? "block" : "none" }}>
            <div>
              <input
                type="text"
                className="inputStyle"
                placeholder="Please enter dimension"
                value={dimensionName}
                state="dimensionName"
                onChange={(e) => {
                  setCicadaState((prev) => ({
                    ...prev,
                    dimensionName: e.target.value,
                  }));
                }}
              />
            </div>
            <Form.Field style={{ marginTop: "20px" }}>
              <Label basic color="teal">
                <Icon name="hand point right" />
                dimensionHash: {dimensionHash}
              </Label>
            </Form.Field>
            <div
              className="btnStyle"
              onClick={function () {
                setCicadaState((prev) => ({
                  ...prev,
                  isLoading: 1,
                }));
                const processCallback = (result) => {
                  console.log(`processCallback status:${result.status}`);
                };
                const succCallback = (data) => {
                  notification.success({
                    message: "success",
                    description: `Hash:${data.data[0]}`,
                  });
                  console.log("succCallback data:", data);
                  setCicadaState((prev) => ({
                    ...prev,
                    dimensionHash: data.data[0],
                    isLoading: 0,

                    active: 5,
                  }));
                };
                const failCallback = (data) => {
                  notification.error({
                    description: "come to nothing",
                  });
                  setCicadaState((prev) => ({
                    ...prev,
                    isLoading: 0,
                  }));
                  console.log("failCallback data:", data);
                };
                cicadaApi.createDimension(
                  dimensionName,
                  subjectHash,
                  processCallback,
                  succCallback,
                  failCallback
                );
              }}
            >
              CREATE
            </div>
          </div>

          {/* 创建五 内容 */}
          <div style={{ display: active == 5 ? "block" : "none" }}>
            <Editor
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              editorState={editorState}
              onEditorStateChange={onEditorStateChange}
            />
            {/* <textarea
            disabled
            value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
          ></textarea> */}
            <div className="btnArr">
              <div className="btnStyle_" onClick={showModal}>
                PREVIEW
              </div>
              <div className="btnStyle_">SAVE</div>
              <div
                className="redbtnStyle"
                onClick={function () {
                  setCicadaState((prev) => ({
                    ...prev,
                    isLoading: 1,
                  }));
                  const processCallback = (result) => {
                    console.log(`processCallback status:${result.status}`);
                  };
                  const succCallback = (data) => {
                    notification.success({
                      message: "success",
                      description: `Hash:${data.data[0]}`,
                    });
                    console.log("succCallback data:", data);
                    setCicadaState((prev) => ({
                      ...prev,
                      contentHash: data.data[0],
                      isLoading: 0,
                    }));
                    setTimeout(() => {
                      history.push("/");
                    }, 1500);
                  };
                  const failCallback = (data) => {
                    setCicadaState((prev) => ({
                      ...prev,
                      isLoading: 0,
                    }));
                    notification.error({
                      description: "come to nothing",
                    });

                    console.log("failCallback data:", data);
                  };
                  getRichText();
                  cicadaApi.createContent(
                    categoryHash,
                    labelHash,
                    subjectHash,
                    dimensionHash,
                    (content = draftToHtml(
                      convertToRaw(editorState.getCurrentContent())
                    )),
                    processCallback,
                    succCallback,
                    failCallback
                  );
                }}
              >
                PUBLISH
              </div>
            </div>
            <Form.Field>
              <Label basic color="teal">
                <Icon name="hand point right" />
                contentHash: {contentHash}
              </Label>
            </Form.Field>
            {/* <button onClick={getRichText}>获取富文本</button> */}
          </div>
        </div>
        <Modal
          title="PREVIEW"
          open={isModal}
          onOk={handleOk}
          onCancel={handleOk}
        >
          <p>{subjectName}</p>
          <p>{labelName}</p>
          <p>{categoryName}</p>
          <p>{dimensionName}</p>

          <p>{content}</p>
        </Modal>
      </Grid.Column>
    </Spin>
  );
}
