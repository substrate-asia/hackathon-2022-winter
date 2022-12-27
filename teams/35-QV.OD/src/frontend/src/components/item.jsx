import styled from "styled-components";
import React from "react";
import publicJs from "../utils/publicJs";

const Box = styled.div`
  transition: 300ms;
 * {
  transition: 300ms;
 }


 background: #222;
  box-shadow: 0 6px 10px rgba(0,0,0,.08);
  width: 100%;
  border-radius: 8px;
  display:inline-block;
  cursor: pointer;
  margin-bottom: 40px;

 &:hover {
  transform:scale(1.03);
  box-shadow: 0px 10px 25px rgba(0,0,0,.08);
 }
 .movie-header {
  padding:0;
  margin: 0;
  width: 100%;
  display: block;
  border-top-left-radius: 8px;
  border-top-right-radius:8px;
  background: #222;
 }

 .header-icon-container {
  width: 100%;
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
 }

 .header-icon {
  text-align:center;
  vertical-align:middle;
  padding:0 20px;
  color: #ffffff;
  font-size: 54px;
  text-shadow:0px 0px 20px #2b60d8, 0px 5px 20px #4F8AFE;
  opacity: .85;
  font-style: normal;
 }

 .header-icon:hover {
  background:rgba(0,0,0,.15);
  font-size: 74px;
  text-shadow:0px 0px 20px #2b60d8, 0px 5px 30px #4F8AFE;
  border-top-left-radius: 10px;
  border-top-right-radius:10px;
  opacity: 1;
 }
 
 .movie-content {
  padding: 12px 12px 20px 12px;
  margin: 0;
 }

 .movie-content-header, .movie-info {
  display: table;
  width: 100%;
 }

 
 .info-section {
  display: table-cell;
  text-transform: uppercase;
  text-align:center;
 }

 .info-section:first-of-type {
  text-align:left;
 }

 .info-section label {
  color: #727475;
  font-size:12px;
  margin-right: 10px;
 }

 .info-section span {
  font-weight: 700;
  font-size: 12px;
  font-family: "Poppins-Light";
 }
 .desc{
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  margin: 5px 0;
  font-size: 14px;
  opacity: 0.7;
 width: 100%;
  min-height: 1.2em;
 }

`

export default function Item(props){
 const { item } = props;
 return<Box >
  {/*<div className="movie-header" style={{background: `url(${DemoImg})`,backgroundSize:"cover"}}>*/}
  <div className="movie-header" style={{background: `url(${item.cover}) no-repeat top`,backgroundSize:"cover"}}>
   <div className="header-icon-container">

     <i className=" header-icon">▶</i>

   </div>
  </div>
  <div className="movie-content">
   <div className="movie-content-header">
     <h3 className="movie-title">{item.title}</h3>
   </div>
   <div className="desc">{item.description}</div>
   <div className="movie-info">

    <div className="info-section">
     <label>Date &amp; Time</label>
     <span>{publicJs.dateFormat(item.created_at)}</span>
    </div>
   </div>
  </div>
 </Box>
}