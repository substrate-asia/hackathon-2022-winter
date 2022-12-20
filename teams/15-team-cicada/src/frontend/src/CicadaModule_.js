import React, { useEffect, useState } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";

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
    // categoryName: "分类1",
    categoryParent:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    categoryHash: "",
    active: 1,
    labelName: "标签1",
    labelHash: "",

    subjectName: "主题1",
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
  const onChange = (_, data) =>
    setCicadaState((prev) => ({ ...prev, [data.state]: data.value }));

  let {
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

  const { keyring } = useSubstrateState();
  const accounts = keyring.getPairs();

  const availableAccounts = [];

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
  };
  const getRichText = () => {
    const htmlStr = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    console.log(htmlStr);
    return htmlStr;
  };
  const updateActive = (i) => {
    setCicadaState((item) => {
      return {
        ...item,
        active: i,
      };
      // console.log(item);
    });
    active = i;
    console.log(i);
  };

  useEffect(() => {
    const html = "<p>Edit Content</p>";
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
    <Grid.Column width={8}>
      <h1>CicadaModule</h1>
      <div>
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
        {/* 创建一 */}
        <div style={{ display: active == 1 ? "block" : "none" }}>
          <div>
            <input
              type="text"
              className="inputStyle"
              placeholder="Subject Title Name"
            />
          </div>
          <div className="btnStyle" onClick={() => updateActive(2)}>
            Create
          </div>
        </div>
        {/* 创建二 */}
        <div style={{ display: active == 2 ? "block" : "none" }}>
          <div className="categoryList">
            {categoryList.map((i) => (
              <div className="category">{i}</div>
            ))}
          </div>

          <div className="btnStyle" onClick={() => updateActive(3)}>
            Create
          </div>
        </div>
        {/* 创建三 */}

        <div style={{ display: active == 3 ? "block" : "none" }}>
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
          <button onClick={getRichText}>获取富文本</button>
        </div>
      </div>

      {/* <Form>
        <Form.Field>
          <Input
            fluid
            label="category name"
            type="text"
            placeholder=""
            value={categoryName}
            state="categoryName"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="parent hash"
            type="text"
            state="categoryParent"
            value={categoryParent}
            onChange={onChange}
          />
        </Form.Field>

        <Form.Field>
          <Label basic color="teal">
            <Icon name="hand point right" />
            categoryHase: {categoryHash}
          </Label>
        </Form.Field>

        <Form.Field style={{ textAlign: "center" }}>
          <div
            className="square"
            onClick={function () {
              const processCallback = (result) => {
                console.log(`processCallback status:${result.status}`);
              };
              const succCallback = (data) => {
                console.log("succCallback data:", data);
                setCicadaState((prev) => ({
                  ...prev,
                  categoryHash: data.data[0],
                }));
              };
              const failCallback = (data) => {
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
            创建分类
          </div>
        </Form.Field>

        <Form.Field>
          <Input
            fluid
            label="Label name"
            type="text"
            placeholder=""
            value={labelName}
            state="labelName"
            onChange={onChange}
          />
        </Form.Field>

        <Form.Field>
          <Label basic color="teal">
            <Icon name="hand point right" />
            labelHash: {labelHash}
          </Label>
        </Form.Field>

        <Form.Field style={{ textAlign: "center" }}>
          <button
            className="square"
            onClick={function () {
              const processCallback = (result) => {
                console.log(`processCallback status:${result.status}`);
              };
              const succCallback = (data) => {
                console.log("succCallback data:", data);
                setCicadaState((prev) => ({
                  ...prev,
                  labelHash: data.data[0],
                }));
              };
              const failCallback = (data) => {
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
            创建标签
          </button>
        </Form.Field>

        <Form.Field>
          <Input
            fluid
            label="subject name"
            type="text"
            placeholder=""
            value={subjectName}
            state="subjectName"
            onChange={onChange}
          />
        </Form.Field>

        <Form.Field>
          <Label basic color="teal">
            <Icon name="hand point right" />
            subjectHash: {subjectHash}
          </Label>
        </Form.Field>

        <Form.Field style={{ textAlign: "center" }}>
          <button
            className="square"
            onClick={function () {
              const processCallback = (result) => {
                console.log(`processCallback status:${result.status}`);
              };
              const succCallback = (data) => {
                console.log("succCallback data:", data);
                setCicadaState((prev) => ({
                  ...prev,
                  subjectHash: data.data[0],
                }));
              };
              const failCallback = (data) => {
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
            创建主题
          </button>
        </Form.Field>

        <Form.Field>
          <Input
            fluid
            label="dimension name"
            type="text"
            placeholder=""
            value={dimensionName}
            state="dimensionName"
            onChange={onChange}
          />
        </Form.Field>

        <Form.Field>
          <Label basic color="teal">
            <Icon name="hand point right" />
            dimensionHash: {dimensionHash}
          </Label>
        </Form.Field>

        <Form.Field style={{ textAlign: "center" }}>
          <button
            className="square"
            onClick={function () {
              const processCallback = (result) => {
                console.log(`processCallback status:${result.status}`);
              };
              const succCallback = (data) => {
                console.log("succCallback data:", data);
                setCicadaState((prev) => ({
                  ...prev,
                  dimensionHash: data.data[0],
                }));
              };
              const failCallback = (data) => {
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
            创建维度
          </button>
        </Form.Field>

        <Form.Field>
          <TextArea
            label="content"
            type="textarea"
            placeholder=""
            value={content}
            state="content"
            onChange={onChange}
          />
        </Form.Field>

        <Form.Field>
          <Label basic color="teal">
            <Icon name="hand point right" />
            contentHash: {contentHash}
          </Label>
        </Form.Field>

        <Form.Field style={{ textAlign: "center" }}>
          <button
            className="square"
            onClick={function () {
              const processCallback = (result) => {
                console.log(`processCallback status:${result.status}`);
              };
              const succCallback = (data) => {
                console.log("succCallback data:", data);
                setCicadaState((prev) => ({
                  ...prev,
                  contentHash: data.data[0],
                }));
              };
              const failCallback = (data) => {
                console.log("failCallback data:", data);
              };
              cicadaApi.createContent(
                categoryHash,
                labelHash,
                subjectHash,
                dimensionHash,
                content,
                processCallback,
                succCallback,
                failCallback
              );
            }}
          >
            创建内容
          </button>
        </Form.Field>
      </Form> */}
    </Grid.Column>
  );
}
