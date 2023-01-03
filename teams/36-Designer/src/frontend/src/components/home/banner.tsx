import styled from "styled-components";

const Box = styled.div`
  width: 100%;
  height: 350px;
  position: relative;
`

export default function BannerRht(){

    return <Box id="ui">
        {
            [...Array(50)].map((item,index)=>(<div className="text" key={index}>Welcome To<br/> Designer !</div>))
        }

    </Box>
}