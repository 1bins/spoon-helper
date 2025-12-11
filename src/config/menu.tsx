import { FaYoutube } from "react-icons/fa";
import { IoIosFolder } from "react-icons/io";
import { AiFillInstagram } from "react-icons/ai";

export const menu = [
  {
    id: 1,
    icon: <FaYoutube size={18} />,
    name: '유튜브 조회수 검색',
    url: 'youtube',
    description: '각 영상의 썸네일·조회수·좋아요·댓글 수 등의 정보를 확인할 수 있습니다.',
    // launched: true,
  },
  {
    id: 2,
    icon: <AiFillInstagram size={21} />,
    name: 'SNS 글 작성 도우미',
    url: 'writer',
    description: '학습된 AI의 API를 활용하여 SNS 글 작성 시 도움을 받을 수 있습니다.',
    launched: true,
  },
  {
    id: 3,
    icon: <IoIosFolder size={18} />,
    name: '준비중',
  }
];