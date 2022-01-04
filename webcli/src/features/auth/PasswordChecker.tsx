
const resultobject = [
  <span style={{color:'red'}}>駄目です</span>,
  <span style={{color:'red'}}>弱すぎます</span>,
  <span style={{color:'orange'}}>弱いです</span>,
  <span style={{color:'orange'}}>まぁまぁです</span>,
  <span style={{color:'green'}}>良いです</span>,
];

export default function PasswordChecker (props: {score: 0|1|2|3|4}){
  return resultobject[props.score];
};