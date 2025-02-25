import { Link } from 'react-router-dom';
import GetData from '../GetData';

export default function UserProfile() {
    let userInfo = GetData(`https://rasilka.ru/planner/employee/`);
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 4)}`);
    return (
        <div>
            {userInfo.map(user => {
                // console.log(user.id);
                <Link to={`${user.id}`} id={user.id}>
                    <span className="user_name">{user.full_name}</span>
                    <span className="user_image">
                        <img src={user.personal_photo} alt="" />
                    </span>
                </Link>;
            })}
        </div>
    );
}
