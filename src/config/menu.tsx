import { FaYoutube } from "react-icons/fa";
import { IoIosFolder } from "react-icons/io";

export const menu = [
  {
    id: 1,
    icon: <FaYoutube size={18} />,
    name: '유튜브 조회수 검색',
    url: 'youtube',
    description: '각 영상의 썸네일·조회수·좋아요·댓글 수 등의 정보를 확인할 수 있습니다.',
    launched: true,
  },
  {
    id: 2,
    icon: <IoIosFolder size={18} />,
    name: '준비중',
  }
];