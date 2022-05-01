const resultobject = [
  <span key={0} style={{ color: 'red' }}>駄目です</span>,
  <span key={0} style={{ color: 'red' }}>弱すぎます</span>,
  <span key={0} style={{ color: 'orange' }}>弱いです</span>,
  <span key={0} style={{ color: 'orange' }}>まぁまぁです</span>,
  <span key={0} style={{ color: 'green' }}>良いです</span>,
];

export default function PasswordChecker(props: { score: 0 | 1 | 2 | 3 | 4 }) {
  return resultobject[props.score];
}
