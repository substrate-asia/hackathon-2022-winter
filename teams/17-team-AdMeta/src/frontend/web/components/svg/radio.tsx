import { FC } from "react";

interface Props {
  isSelect?: boolean
}

const RadioSVG: FC<Props> = ({ isSelect = false }) => {
  return (
    isSelect
      ?
      <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.3114 7C13.3114 10.0424 10.8548 12.5 7.83538 12.5C4.81592 12.5 2.35938 10.0424 2.35938 7C2.35938 3.95757 4.81592 1.5 7.83538 1.5C10.8548 1.5 13.3114 3.95757 13.3114 7Z" fill="#254CA9" stroke="#3772FF" strokeWidth="3" />
      </svg>
      :
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.453 7C12.453 10.0424 9.99645 12.5 6.97698 12.5C3.95752 12.5 1.50098 10.0424 1.50098 7C1.50098 3.95757 3.95752 1.5 6.97698 1.5C9.99645 1.5 12.453 3.95757 12.453 7Z" fill="#141416" stroke="#2A2D36" strokeWidth="3" />
      </svg>
  )
}

export default RadioSVG;