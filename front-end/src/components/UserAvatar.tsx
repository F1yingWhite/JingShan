import { Avatar } from "antd";

interface UserAvatarProps {
  user: {
    avatar?: string;
    username: string;
  } | null;
  onClick?: () => void;
  width?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, onClick, width }) => {
  const cursorClass = onClick ? 'cursor-pointer' : '';
  return (
    <>
      {user ? (
        user.avatar ? (
          <Avatar className={`mx-2 flex-shrink-0 ${cursorClass}`} size={width ? width : 45} src={user.avatar} onClick={onClick} />
        ) : (
          <Avatar className={`mx-2 ${cursorClass}`} style={{ backgroundColor: '#fde3cf', color: '#f56a00' }} size={width ? width : 45} onClick={onClick}>
            {user.username[0]}
          </Avatar>
        )
      ) : (
        <Avatar className={`mx-2 flex-shrink-0 ${cursorClass}`} size={45} src={"/heshang.png"} />
      )}
    </>
  );
};

export default UserAvatar;