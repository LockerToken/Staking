import createSvg from "./createSvg";

export default createSvg((props) => (
  <svg
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    fill="none"
  >
    <path
      d="M0 260C0 116.406 116.406 0 260 0H764C907.594 0 1024 116.406 1024 260V764C1024 907.594 907.594 1024 764 1024H260C116.406 1024 0 907.594 0 764V260Z"
      fill="white"
    />
    <path
      d="M512.3 215C615.619 301.288 734.101 295.966 767.953 295.966C760.548 786.707 704.128 689.395 512.3 827C320.472 689.395 264.405 786.707 257 295.966C290.499 295.966 408.981 301.288 512.3 215Z"
      stroke="#3375BB"
      strokeWidth="70"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));
