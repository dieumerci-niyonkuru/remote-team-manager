const OnlineStatus = ({ online }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
);
export default OnlineStatus;
