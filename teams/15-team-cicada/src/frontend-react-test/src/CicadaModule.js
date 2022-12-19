import React, { useState } from "react";
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

export default function Main(props) {
  const [cicadaState, setCicadaState] = useState({
    categoryName: "分类1",
    categoryParent:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    categoryHash: "",

    labelName: "标签1",
    labelHash: "",

    subjectName: "主题1",
    subjectHash: "",

    dimensionName: "维度1",
    dimensionHash: "",

    content: "这是一篇测试内容",
    contentHash: "",
  });
  const { api, currentAccount } = useSubstrateState();
  const cicadaApi = new CicadaApi(currentAccount, api);

  const onChange = (_, data) =>
    setCicadaState((prev) => ({ ...prev, [data.state]: data.value }));

  const {
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
    <Grid.Column width={8}>
      <h1>CicadaModule</h1>
      <Form>
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
                labelName,
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
      </Form>
    </Grid.Column>
  );
}
